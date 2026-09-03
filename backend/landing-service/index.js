require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });
const express = require('express');
const cors = require('cors');
const knexConfig = require('./db/knexfile');
const knex = require('knex')(knexConfig[process.env.NODE_ENV || 'development']);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Init DB and seed if empty (for local dev convenience)
async function initDb() {
  if (process.env.NODE_ENV === 'development') {
    const exists = await knex.schema.hasTable('magazines');
    if (!exists) {
      console.log('Creating magazines table...');
      await knex.schema.createTable('magazines', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('cover_url');
        table.text('short_description');
        table.boolean('is_public').defaultTo(true);
      });
      console.log('Seeding magazines...');
      await knex('magazines').insert([
        { title: 'Tech Weekly', short_description: 'The latest in technology.', cover_url: '/assets/images/covers/tech-weekly.jpg' },
        { title: 'Sports Daily', short_description: 'Daily sports news.', cover_url: '/assets/images/covers/sports-daily.jpg' },
        { title: 'Kids Zone', short_description: 'Fun and games.', cover_url: '/assets/images/covers/kids-zone.jpg' }
      ]);
    }
  }
}

// Endpoint to fetch public magazines for the landing page
app.get('/magazines', async (req, res) => {
  try {
    const magazines = await knex('magazines')
      .where({ is_public: true })
      .select('id', 'title', 'cover_url', 'short_description');
    res.json(magazines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch public details of a specific magazine
app.get('/magazines/:id', async (req, res) => {
  try {
    const magazine = await knex('magazines')
      .where({ id: req.params.id, is_public: true })
      .select('id', 'title', 'cover_url', 'short_description')
      .first();
    
    if (!magazine) {
      return res.status(404).json({ error: 'Magazine not found' });
    }
    res.json(magazine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, async () => {
  await initDb();
  console.log(`🚀 Landing Service is running on http://localhost:${PORT}`);
});
