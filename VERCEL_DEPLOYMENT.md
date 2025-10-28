# Vercel Deployment Guide

## Overview

This guide explains how to deploy the 7SS Cleaning Roster Automation App to Vercel. The application uses:
- React frontend (Vite)
- Vercel Serverless Functions (API)
- Neon PostgreSQL database
- JWT authentication

## Prerequisites

1. Vercel account (https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. Neon PostgreSQL database (https://neon.tech)
4. Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

You need to configure the following environment variables in Vercel:

### Required Variables

1. **DATABASE_URL**: Your Neon PostgreSQL connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Get this from your Neon dashboard

2. **JWT_SECRET**: A secure random string for JWT token signing
   - **CRITICAL**: This MUST be set in production - the application will fail without it
   - Generate with: `openssl rand -base64 32`
   - Keep this secret and never commit it to version control
   - Example: `JWT_SECRET=your_randomly_generated_secret_here`

### Optional Variables (already configured in code)

- Admin password is hardcoded as `7SS#1` in the codebase
- Resident usernames match their names (passwordless Netflix-style login)

## Database Setup

### Step 1: Create Neon Database

1. Go to https://neon.tech and create an account
2. Create a new project
3. Copy the connection string (DATABASE_URL)

### Step 2: Run Database Migrations

Before deploying, you need to set up the database schema:

```bash
# Install dependencies
npm install

# Set your DATABASE_URL in a .env file locally
echo "DATABASE_URL=your_connection_string_here" > .env

# Push the database schema to Neon
npm run db:push
```

This will create all necessary tables (users, weekly_rosters, tasks, task_completions, bathroom_assignments).

### Step 3: Seed Initial Users

The application requires 6 resident accounts. These should be created manually in the database or via a seed script:

```sql
INSERT INTO users (name, username, password, role) VALUES
('Illy', 'illy', 'hashed_password_illy', 'resident'),
('Atilla', 'atilla', 'hashed_password_atilla', 'resident'),
('Allegra', 'allegra', 'hashed_password_allegra', 'resident'),
('Perpetua', 'perpetua', 'hashed_password_perpetua', 'resident'),
('Eman', 'eman', 'hashed_password_eman', 'resident'),
('Dania', 'dania', 'hashed_password_dania', 'resident');
```

Note: Passwords should be hashed using the `hashPassword` function from `server/auth.ts`. For Netflix-style login, each resident's password matches their username (e.g., username: "illy", password: "illy").

## Vercel Deployment

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Your Repository**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your Git repository

2. **Configure Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add `DATABASE_URL` with your Neon connection string
   - Add `JWT_SECRET` with your generated secret
   - Apply to Production, Preview, and Development environments

3. **Deploy**
   - Vercel will automatically detect the configuration from `vercel.json`
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# During deployment, you'll be prompted to:
# - Link to existing project or create new one
# - Set environment variables (if not already set)
```

### Adding Environment Variables via CLI

```bash
# Add DATABASE_URL
vercel env add DATABASE_URL production

# Add JWT_SECRET
vercel env add JWT_SECRET production
```

## Build Configuration

The project is configured with `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration:
- Builds the frontend using Vite
- Routes API requests to serverless functions in `/api`
- Serves the frontend as a SPA

## API Endpoints

The application uses the following serverless API endpoints:

### Authentication
- `POST /api/login` - Login with username/password
- `GET /api/user` - Get current authenticated user

### Roster Management
- `GET /api/current-week` - Get current week's roster
- `GET /api/history` - Get all historical rosters

### Task Management
- `POST /api/tasks` - Create new task (admin only)
- `POST /api/tasks/[id]/complete` - Mark task as complete
- `DELETE /api/tasks/[id]/delete` - Delete task (admin only)

### Bathroom Management
- `POST /api/bathrooms/[id]/update` - Update bathroom assignment
- `POST /api/bathrooms/[id]/complete` - Mark bathroom as complete

## Testing the Deployment

After deployment:

1. **Access the Application**
   - Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
   - You should see the Netflix-style login screen

2. **Test Resident Login**
   - Click on any resident profile
   - Should automatically log in (passwordless)

3. **Test Admin Login**
   - Click "Admin Access"
   - Enter any resident username
   - Enter password: `7SS#1`
   - Should log in with admin privileges

4. **Verify Features**
   - Check current week roster loads
   - Verify task assignments rotate correctly
   - Test task completion
   - Test bathroom assignment updates

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
- Verify DATABASE_URL is correctly set in Vercel
- Ensure your Neon database is running
- Check that the connection string includes `?sslmode=require`

### JWT Authentication Issues

If authentication fails:
- Verify JWT_SECRET is set in Vercel
- Clear browser localStorage and try logging in again
- Check browser console for token-related errors

### API Function Timeout

If API functions timeout:
- Neon serverless databases can cold-start - first request might be slow
- Consider upgrading Vercel plan for longer function timeouts
- Check Vercel function logs for specific errors

### Build Failures

If the build fails:
- Check Vercel build logs for specific errors
- Ensure all dependencies are listed in package.json
- Verify TypeScript compilation succeeds locally: `npm run build`

## Maintenance

### Updating the Application

To deploy updates:
1. Push changes to your Git repository
2. Vercel automatically rebuilds and deploys
3. Or manually redeploy via Vercel dashboard

### Database Migrations

When schema changes are needed:
1. Update `shared/schema.ts`
2. Run `npm run db:push` locally to test
3. Apply migrations to production database
4. Redeploy the application

### Monitoring

- Use Vercel Analytics to monitor traffic
- Check Vercel Function Logs for API errors
- Monitor Neon database performance

## Security Notes

- JWT tokens are stored in browser localStorage
- Tokens expire after 7 days
- Admin password (`7SS#1`) is hardcoded - consider changing for production
- Database credentials are stored securely in Vercel environment variables
- All API endpoints use JWT authentication except login

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Check Neon documentation: https://neon.tech/docs
- Review application logs in Vercel dashboard
