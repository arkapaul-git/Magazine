require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });
const express = require('express');
const cors = require('cors');
const knexConfig = require('./db/knexfile');
const knex = require('knex')(knexConfig[process.env.NODE_ENV || 'development']);

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

async function initDb() {
  if (process.env.NODE_ENV === 'development') {
    const exists = await knex.schema.hasTable('user_profiles');
    if (!exists) {
      console.log('Creating user_profiles table...');
      await knex.schema.createTable('user_profiles', table => {
        table.integer('user_id').primary(); // Foreign key to Auth service conceptually
        table.string('first_name');
        table.string('last_name');
        table.text('bio');
        table.string('avatar_url');
      });
      console.log('user_profiles table created.');
    }
  }
}

// Get user profile
app.get('/profile/:userId', async (req, res) => {
  try {
    const profile = await knex('user_profiles').where({ user_id: req.params.userId }).first();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/profile/:userId', async (req, res) => {
  const { first_name, last_name, bio, avatar_url } = req.body;
  const user_id = req.params.userId;

  try {
    const existing = await knex('user_profiles').where({ user_id }).first();
    
    if (existing) {
      await knex('user_profiles').where({ user_id }).update({ first_name, last_name, bio, avatar_url });
    } else {
      await knex('user_profiles').insert({ user_id, first_name, last_name, bio, avatar_url });
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, async () => {
  await initDb();
  console.log(`🚀 User Service is running on http://localhost:${PORT}`);
});
