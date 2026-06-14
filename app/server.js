const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const { requireAuth, redirectIfAuth } = require('./middleware/auth');

const app = express();
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth:4000';

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secret123',
  database: process.env.DB_NAME || 'patientdb',
  port: 5432,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use((req, res, next) => {
  res.locals.currentUser = null;
  next();
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(10),
        diagnosis VARCHAR(255),
        blood_pressure VARCHAR(20),
        heart_rate INTEGER,
        temperature DECIMAL(4,1),
        status VARCHAR(20) DEFAULT 'Admitted',
        admitted_date TIMESTAMP DEFAULT NOW(),
        notes TEXT,
        created_by VARCHAR(50)
      );
    `);
    console.log('Patient Service DB initialized');
  } catch (err) {
    console.error('DB init error:', err.message);
    setTimeout(initDB, 3000);
  }
}

// Auth Routes — patient app talks to auth service
app.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null, success: null });
});

app.post('/login', redirectIfAuth, async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await axios.post(`${AUTH_SERVICE}/auth/login`, { username, password });
    const { token } = response.data;
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000
    });
    res.redirect('/');
  } catch (err) {
    const error = err.response?.data?.error || 'Login failed';
    res.render('login', { error, success: null });
  }
});

app.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', redirectIfAuth, async (req, res) => {
  const { fullname, username, password, confirm_password, role } = req.body;
  if (password !== confirm_password) {
    return res.render('register', { error: 'Passwords do not match' });
  }
  try {
    await axios.post(`${AUTH_SERVICE}/auth/register`, { fullname, username, password, role });
    res.render('login', { error: null, success: 'Account created! Please sign in.' });
  } catch (err) {
    const error = err.response?.data?.error || 'Registration failed';
    res.render('register', { error });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Patient Routes
app.get('/', requireAuth, async (req, res) => {
  try {
    const search = req.query.search || '';
    let result;
    if (search) {
      result = await pool.query(
        `SELECT * FROM patients
         WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR diagnosis ILIKE $1
         ORDER BY admitted_date DESC`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM patients ORDER BY admitted_date DESC');
    }
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Admitted' THEN 1 ELSE 0 END) as admitted,
        SUM(CASE WHEN status = 'Discharged' THEN 1 ELSE 0 END) as discharged,
        SUM(CASE WHEN status = 'Critical' THEN 1 ELSE 0 END) as critical
      FROM patients
    `);
    res.render('index', { patients: result.rows, stats: stats.rows[0], search });
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
});

app.get('/add', requireAuth, (req, res) => res.render('add'));

app.post('/add', requireAuth, async (req, res) => {
  const { first_name, last_name, dob, gender, diagnosis,
          blood_pressure, heart_rate, temperature, status, notes } = req.body;
  try {
    await pool.query(
      `INSERT INTO patients
       (first_name, last_name, dob, gender, diagnosis, blood_pressure, heart_rate, temperature, status, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [first_name, last_name, dob, gender, diagnosis,
       blood_pressure, heart_rate, temperature, status, notes, req.user.username]
    );
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.get('/patient/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    res.render('patient', { patient: result.rows[0] });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.post('/discharge/:id', requireAuth, async (req, res) => {
  try {
    await pool.query("UPDATE patients SET status = 'Discharged' WHERE id = $1", [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.post('/critical/:id', requireAuth, async (req, res) => {
  try {
    await pool.query("UPDATE patients SET status = 'Critical' WHERE id = $1", [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.post('/delete/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

initDB();
app.listen(3000, () => console.log('Patient Service running on port 3000'));
