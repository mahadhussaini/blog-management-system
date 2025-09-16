# 🚀 Complete Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd blog-management-system/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:

```bash
# Copy the template file
cp env.example .env
```

Then edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/blog-management
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-management

# JWT Configuration (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_make_it_at_least_32_characters_long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Start MongoDB
**Option A: Local MongoDB**
```bash
# Start MongoDB service (if using local installation)
mongod
```

**Option B: MongoDB Atlas**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a free cluster
- Get connection string and update `MONGODB_URI` in `.env`

### 5. Start Backend Server
```bash
npm run dev
```
The backend will run on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ../frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start React Development Server
```bash
npm start
```
The frontend will run on `http://localhost:3000`

## 🧪 Testing the Application

### 1. Health Check
Visit `http://localhost:5000/api/health` to verify backend is running.

### 2. Frontend Access
Open `http://localhost:3000` in your browser.

### 3. Test User Registration
1. Go to `/register`
2. Create an admin account first (this will be the first user)
3. Create additional author accounts

### 4. Test Features
- **Authentication**: Login/logout functionality
- **Post Creation**: Create posts with rich text editor
- **Blog Browsing**: View published posts with search/filter
- **Admin Panel**: User management (if logged in as admin)
- **Profile**: Update user information

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running (if using local)
mongod

# Or check your connection string in .env
```

**Port Already in Use:**
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change PORT in .env
```

### Frontend Issues

**Dependencies Missing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build Errors:**
```bash
# Clear cache
npm start -- --reset-cache
```

### Common Issues

**CORS Errors:**
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default is `http://localhost:3000`

**JWT Token Issues:**
- Make sure `JWT_SECRET` is set and at least 32 characters long
- Clear browser localStorage if having auth issues

**Rate Limiting Errors:**
- The app includes rate limiting for security
- Wait a minute if you hit the limit during testing

## 🚀 Production Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
heroku config:set JWT_SECRET="your_production_jwt_secret"
heroku config:set NODE_ENV="production"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://your-heroku-app.herokuapp.com
```

## 📋 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/blog-management | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | 7d | No |
| `JWT_COOKIE_EXPIRE` | JWT cookie expiration | 7 | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | No |
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |

## 🎯 Features Overview

### User Roles
- **Admin**: Full access to user management, all posts, system settings
- **Author**: Create/edit their own posts, manage profile
- **Public**: Browse published posts, search, and filter

### Key Features
- ✅ JWT Authentication with role-based access
- ✅ Rich text editor for post creation
- ✅ Advanced search and filtering
- ✅ User management dashboard
- ✅ Responsive design for all devices
- ✅ Rate limiting and security middleware
- ✅ Error handling and validation
- ✅ Toast notifications for user feedback

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify your environment variables are correct
3. Ensure MongoDB is running and accessible
4. Check network connectivity between frontend and backend

**Happy blogging! 🎉**
