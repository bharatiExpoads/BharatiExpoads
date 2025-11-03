# Backend API with Express, PostgreSQL, and Prisma

This is the backend service for the application with authentication, user management, and role-based access control.

## Database Setup

### Prerequisites

1. Make sure PostgreSQL is installed and running on your system
2. Update the `.env` file with your PostgreSQL credentials:

```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/demo1"
JWT_SECRET="your_super_secret_key_for_jwt_tokens"
PORT=5000
```

### Initialize the Database

Run the database initialization script to:
- Create the database if it doesn't exist
- Run migrations to set up tables
- Create the Super Admin account

```bash
npm run init:db
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## Authentication

### Super Admin Credentials

Email: nitesh@gmail.com  
Password: nitesh@123

### Authentication Flow

1. Super Admin - Hardcoded credentials for initial access
2. Admin - Created by Super Admin, has ACTIVE status by default
3. Employee - Must register with an Admin's ID, starts with PENDING status

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register as an employee
- `POST /api/auth/admin/create` - Create admin (Super Admin only)

### User Management
- `GET /api/users` - Get users based on role
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Admin Operations
- `GET /api/admin/employees` - Get employees (Admin only)
- `PUT /api/admin/employees/:employeeId/approve` - Approve employee (Admin only)
- `PUT /api/admin/employees/:employeeId/deactivate` - Deactivate employee (Admin only)

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check if PostgreSQL is running
2. Verify your database credentials in `.env`
3. Run the initialization script: `npm run init:db`

### Authentication Issues

- The Super Admin account is automatically created during initialization
- Employees require approval from their Admin to get ACTIVE status
- Check JWT tokens for expiration