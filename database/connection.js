const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'videoplayer',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.log('Database connection test successful:', result.rows[0]);
  }
});

module.exports = pool;
