require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const knexConfig = require('./db/knexfile');
const knex = require('knex')(knexConfig[process.env.NODE_ENV || 'development']);

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());

async function initDb() {
  if (process.env.NODE_ENV === 'development') {
    const exists = await knex.schema.hasTable('users');
    if (!exists) {
      console.log('Creating users table...');
      await knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('password_hash').notNullable();
        table.string('system_role').defaultTo('USER'); // Enforcing Default-Viewer Rule
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
      console.log('Users table created.');
    }
  }
}

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existing = await knex('users').where({ email }).first();
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Default-Viewer Signup Rule: Role is explicitly 'USER'
    const [userId] = await knex('users').insert({
      email,
      password_hash,
      system_role: 'USER' 
    });

    res.status(201).json({ 
      message: 'User created successfully', 
      user: { id: userId, email, system_role: 'USER' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, system_role: user.system_role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signed in successfully',
      token,
      user: { id: user.id, email: user.email, system_role: user.system_role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, async () => {
  await initDb();
  console.log(`🚀 Auth Service is running on http://localhost:${PORT}`);
});
