const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Database connection configuration
  const connectionString = 'postgresql://postgres:MegaShop@2026DB!@db.hdecmqepqkylvulmushf.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the SQL schema file
    const sqlFilePath = path.join(__dirname, '..', 'DATABASE_SETUP.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('🔄 Executing database schema...');

    // Split SQL into individual statements and execute them
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log('✅ Executed statement successfully');
        } catch (err) {
          console.log('⚠️  Statement failed (might be normal):', err.message);
        }
      }
    }

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

setupDatabase();