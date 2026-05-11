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

// Database setup function - ONLY for local development
const setupDatabase = async () => {
  try {
    console.log('🔄 Setting up database schema...');

    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Skipping database setup in production. Database should be set up manually.');
      return;
    }

    // For development only - create basic tables if they don't exist
    console.log('✅ Database setup skipped - use Supabase SQL editor for schema setup');
    console.log('🎉 Database connection ready!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error details:', error);
  }
};

// Export both pool and setup function
module.exports = pool;
module.exports.setupDatabase = setupDatabase;

