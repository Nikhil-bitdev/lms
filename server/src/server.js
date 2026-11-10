require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, passwordHash]
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return response.status(409).json({ error: 'Email already registered' });
    }
    console.error(error);
    response.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});