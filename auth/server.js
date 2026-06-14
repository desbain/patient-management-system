const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'auth-service-secret-2024';

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secret123',
  database: process.env.DB_NAME || 'patientdb',
  port: 5432,
});

app.use(express.json());
app.use(cors());

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'nurse',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const adminExists = await pool.query(
      "SELECT id FROM users WHERE username = 'admin'"
    );
    if (adminExists.rows.length === 0) {
      const hashed = await bcrypt.hash('Admin@1234', 10);
      await pool.query(
        "INSERT INTO users (fullname, username, password, role) VALUES ($1,$2,$3,$4)",
        ['System Admin', 'admin', hashed, 'admin']
      );
      console.log('Default admin created: admin / Admin@1234');
    }
    console.log('Auth Service DB initialized');
  } catch (err) {
    console.error('DB init error:', err.message);
    setTimeout(initDB, 3000);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service Running', port: 4000 });
});

// Register
app.post('/auth/register', async (req, res) => {
  const { fullname, username, password, role } = req.body;
  try {
    const exists = await pool.query(
      'SELECT id FROM users WHERE username = $1', [username]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (fullname, username, password, role) VALUES ($1,$2,$3,$4) RETURNING id, username, fullname, role',
      [fullname, username, hashed, role || 'nurse']
    );
    res.status(201).json({ message: 'User created', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1', [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Issue JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, fullname: user.fullname, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify token
app.post('/auth/verify', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

// Get all users (admin only - verified by patient app)
app.get('/auth/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, fullname, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDB();
app.listen(4000, () => console.log('Auth Service running on port 4000'));
