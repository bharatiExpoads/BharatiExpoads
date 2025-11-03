const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Start the cron job for hoarding availability updates
require('./cron/updateHoardingAvailability');

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors({   origin: [
    'https://bharatiexpoads-1.onrender.com',
    'https://bharati-expoads.vercel.app'
  ] , methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const adminProfileRoutes = require('./routes/adminProfile');
app.use('/api', adminProfileRoutes);

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');
const masterRoutes = require('./routes/master');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/master', masterRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Database connection and initialization
const checkDatabaseConnection = async () => {
  try {
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if the tables exist
    try {
      await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')`;
      console.log('✅ Checking database tables');
      
      // Try to initialize Super Admin
      try {
        const email = 'nitesh@gmail.com';
        const superAdmin = await prisma.user.findUnique({
          where: { email }
        });
        
        if (!superAdmin) {
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
          
          console.log('✅ Super Admin initialized successfully');
        } else {
          console.log('✅ Super Admin already exists');
        }
      } catch (userError) {
        if (userError.code === 'P2021') {
          console.error('❌ Users table does not exist properly. Please run migrations again');
          console.log('Run: npm run prisma:migrate');
          return false;
        } else {
          console.error('❌ Error checking users:', userError);
          return false;
        }
      }
    } catch (tableError) {
      console.error('❌ Database tables do not exist. Please run migrations');
      console.log('Run: node scripts/run-migrations.js');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please run "node scripts/init-db.js" to initialize the database');
    return false;
  }
};

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await checkDatabaseConnection();
});
