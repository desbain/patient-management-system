const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secret123',
  database: process.env.DB_NAME || 'patientdb',
  port: 5432,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

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
        notes TEXT
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('DB init error:', err);
    setTimeout(initDB, 3000);
  }
}

app.get('/', async (req, res) => {
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

app.get('/add', (req, res) => res.render('add'));

app.post('/add', async (req, res) => {
  const { first_name, last_name, dob, gender, diagnosis,
          blood_pressure, heart_rate, temperature, status, notes } = req.body;
  try {
    await pool.query(
      `INSERT INTO patients 
       (first_name, last_name, dob, gender, diagnosis, blood_pressure, heart_rate, temperature, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [first_name, last_name, dob, gender, diagnosis,
       blood_pressure, heart_rate, temperature, status, notes]
    );
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error saving patient: ' + err.message);
  }
});

app.get('/patient/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    res.render('patient', { patient: result.rows[0] });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.post('/discharge/:id', async (req, res) => {
  try {
    await pool.query("UPDATE patients SET status = 'Discharged' WHERE id = $1", [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.post('/critical/:id', async (req, res) => {
  try {
    await pool.query("UPDATE patients SET status = 'Critical' WHERE id = $1", [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.post('/delete/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

initDB();
app.listen(3000, () => console.log('Patient System running on port 3000'));
