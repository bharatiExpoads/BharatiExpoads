const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Database initialization script started');
  
  try {
    // Extract database name from connection string
    const url = process.env.DATABASE_URL;
    const dbName = url.split('/').pop().split('?')[0];
    const baseConnectionString = url.replace(`/${dbName}`, '/postgres');
    
    console.log(`Checking if database '${dbName}' exists...`);
    
    // Connect to postgres database to check if our DB exists
    const pool = new Pool({
      connectionString: baseConnectionString
    });
    
    try {
      // Try to create the database if it doesn't exist
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } catch (createError) {
      if (createError.message.includes('already exists')) {
        console.log(`Database '${dbName}' already exists`);
      } else {
        throw createError;
      }
    } finally {
      await pool.end();
    }
    
    // Run migrations to ensure schema is up to date
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Initialize the prisma client
    console.log('Connecting to database...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Initialize Super Admin
    console.log('Checking for Super Admin account...');
    const email = 'nitesh@gmail.com';
    const superAdmin = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!superAdmin) {
      console.log('Creating Super Admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('nitesh@123', salt);
      
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE'
        }
      });
      
      console.log('✅ Super Admin created successfully');
    } else {
      console.log('✅ Super Admin already exists');
    }
    
    await prisma.$disconnect();
    console.log('✅ Database initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    process.exit(1);
  }
}

main();