const { execSync } = require('child_process');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

async function main() {
  console.log('🔄 Complete Database Reset and Setup');
  console.log('-----------------------------------');

  try {
    // Parse DATABASE_URL from .env
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in .env file');
    }

    // Extract database name from connection string
    const dbNameMatch = dbUrl.match(/\/([^?]+)/);
    if (!dbNameMatch || !dbNameMatch[1]) {
      throw new Error('Could not extract database name from DATABASE_URL');
    }
    const dbName = dbNameMatch[1];
    
    // Create connection to postgres database (not the app database)
    const pgConnectionString = dbUrl.replace(`/${dbName}`, '/postgres');
    console.log(`📊 Connecting to PostgreSQL server...`);
    
    const pool = new Pool({ connectionString: pgConnectionString });
    
    try {
      // Drop the database if it exists
      console.log(`🗑️ Dropping database "${dbName}" if it exists...`);
      await pool.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
      console.log(`✅ Database "${dbName}" dropped successfully (or didn't exist)`);
      
      // Create a fresh database
      console.log(`🔨 Creating fresh database "${dbName}"...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully`);
    } finally {
      // Close the connection to postgres
      await pool.end();
    }
    
    // Delete migration files to ensure clean migration
    const migrationDir = path.join(__dirname, '../prisma/migrations');
    if (fs.existsSync(migrationDir)) {
      console.log('🧹 Removing existing migration files...');
      try {
        fs.rmSync(migrationDir, { recursive: true, force: true });
      } catch (error) {
        console.log(`⚠️ Could not delete migration directory: ${error.message}`);
        console.log('Continuing anyway...');
      }
    }
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run migrations
    console.log('🚀 Running database migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    console.log('');
    console.log('✅ Database reset and setup completed successfully!');
    console.log('You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error(`❌ Error during database reset: ${error.message}`);
    process.exit(1);
  }
}

main();