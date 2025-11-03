const { execSync } = require('child_process');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

console.log('🚀 Running Prisma migrations...');

async function main() {
  try {
    // Force reset Prisma migrations
    console.log('Forcing Prisma schema creation...');
    
    // Delete migration files to ensure clean migration
    const migrationDir = path.join(__dirname, '../prisma/migrations');
    if (fs.existsSync(migrationDir)) {
      console.log('Removing existing migration files...');
      execSync('rmdir /s /q "' + migrationDir + '"', { stdio: 'inherit' });
    }
    
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run migrations with force flag
    console.log('Running database migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    // Connect to DB to verify tables
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check if users table exists
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    if (result[0].exists) {
      console.log('✅ Database tables created successfully!');
    } else {
      console.error('❌ Database tables were not created. Please check your Prisma schema.');
      process.exit(1);
    }
    
    await prisma.$disconnect();
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

main();