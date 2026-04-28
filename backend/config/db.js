const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Database setup function
const setupDatabase = async () => {
  try {
    console.log('🔄 Setting up database schema...');

    // Read the SQL schema file
    const sqlFilePath = path.join(__dirname, '..', '..', 'DATABASE_SETUP.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the entire SQL file
    try {
      await pool.query(sqlContent);
      console.log('✅ Database schema and sample data created successfully');
    } catch (err) {
      // Skip errors for existing tables/indexes
      if (err.code === '42P07' || err.message.includes('already exists')) {
        console.log('✅ Database schema already exists, checking for missing columns...');

        // Check if profile_image column exists in users table
        try {
          const checkColumn = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'profile_image'
          `);

          if (checkColumn.rows.length === 0) {
            console.log('🔄 Adding profile_image column to users table...');
            await pool.query(`ALTER TABLE users ADD COLUMN profile_image TEXT`);
            console.log('✅ profile_image column added successfully');
          } else {
            console.log('✅ profile_image column already exists');
          }
        } catch (columnErr) {
          console.log('⚠️  Could not check/add profile_image column:', columnErr.message);
        }
      } else {
        console.error('❌ Schema creation error:', err.message);
        throw err;
      }
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error details:', error);
  }
};

// Export both pool and setup function
module.exports = pool;
module.exports.setupDatabase = setupDatabase;

