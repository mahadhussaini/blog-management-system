# Blog Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) blog management system with user authentication, role-based authorization, and content management capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based login and registration
- **Role-Based Access Control**: Admin and Author roles with different permissions
- **Blog Post Management**: Create, edit, delete, and publish blog posts
- **Public Blog View**: Browse published posts with search and pagination
- **Comment System**: Users can comment on blog posts
- **Dashboard**: Different views for admins and authors
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS

### Technical Features
- **Backend**: Express.js with MongoDB and Mongoose
- **Frontend**: React with Context API for state management
- **Authentication**: JWT tokens with secure cookie handling
- **API**: RESTful endpoints with proper error handling
- **Security**: Input validation, CORS, rate limiting
- **UI/UX**: Modern, clean interface with loading states and error handling

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notification system
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd blog-management-system
```

### 2. React Router v7 Compatibility

This application is configured with React Router v7 future flags to ensure compatibility and prevent warnings:

```javascript
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }}
>
```

**Future Flags Explanation:**
- `v7_relativeSplatPath`: Fixes relative route resolution within splat routes (`path="*"`)
- `v7_startTransition`: Enables React 18 concurrent features
- `v7_fetcherPersist`: Improves fetcher persistence
- `v7_normalizeFormMethod`: Normalizes form method handling
- `v7_partialHydration`: Enables partial hydration
- `v7_skipActionErrorRevalidation`: Skips error revalidation for actions

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# Edit the following variables:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string for JWT signing
# - FRONTEND_URL: Frontend URL (http://localhost:3000 for development)

# Start MongoDB (if running locally)
mongod

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will start on `http://localhost:3000`

### 5. Verify React Router Fix

After starting the development server, check the browser console. You should **NOT** see the React Router warning:

```
Relative route resolution within Splat routes is changing in v7
```

If you still see this warning, ensure all future flags are properly configured in `src/index.js`.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/blog-management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service: `mongod`
3. Use default connection string: `mongodb://localhost:27017/blog-management`

#### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

### Troubleshooting React Router Warnings

If you encounter React Router warnings in the console, ensure that:

1. **All future flags are enabled** in `src/index.js`
2. **React Router version** is compatible (v6.8.1+ recommended)
3. **Browser cache is cleared** after making changes
4. **Development server is restarted** after configuration changes

The application includes a `RouteDebugger` component that logs route changes for debugging purposes.

## 📱 Usage

### User Roles

1. **Admin**:
   - Full access to all features
   - Can manage users (view, edit, delete)
   - Can create, edit, and delete any post
   - Access to admin dashboard and analytics

2. **Author**:
   - Can create, edit, and delete their own posts
   - Can publish or save posts as drafts
   - Access to personal dashboard
   - Can comment on posts

### Getting Started

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in with your credentials at `/login`
3. **Dashboard**: Access your dashboard based on your role
4. **Create Posts**: Use the "Create Post" button to write new content
5. **Manage Content**: Edit or delete your posts from the dashboard
6. **Browse Blog**: Visit `/blog` to see all published posts

## 🏗️ Project Structure

```
blog-management-system/
├── backend/
│   ├── models/          # MongoDB models (User, Post, Comment)
│   ├── routes/          # API route handlers
│   ├── middleware/      # Authentication & validation middleware
│   ├── server.js        # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context for state management
│   │   ├── hooks/       # Custom hooks for API calls
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main React component
│   ├── public/          # Static assets
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all published posts (public)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (owner/admin)
- `DELETE /api/posts/:id` - Delete post (owner/admin)
- `GET /api/posts/user/my-posts` - Get user's posts

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment (owner)
- `DELETE /api/comments/:id` - Delete comment (owner/admin)

## 🚀 Deployment

### Backend Deployment (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render and connect the repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Health check path: `/api/health`
7. Set environment variables in Render Dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your MongoDB connection string>`
   - `JWT_SECRET=<your random secret>`
   - `JWT_EXPIRE=7d`
   - `JWT_COOKIE_EXPIRE=7`
   - `FRONTEND_URL=https://<your-vercel-domain>`
8. Deploy and note the backend URL: `https://<render-app>.onrender.com`

### Frontend Deployment (Vercel)
1. Push your code to GitHub
2. Import the project in Vercel, set root directory to `frontend`
3. Framework preset: Create React App
4. Build command: `npm run build` (autodetected)
5. Output directory: `build`
6. Environment variables:
   - `REACT_APP_API_URL=https://<render-app>.onrender.com`
7. Deploy and get your domain, e.g. `https://<project>.vercel.app`
8. Go back to Render and update `FRONTEND_URL` to your Vercel domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB is running (if using local installation)
4. Check the network tab for API request failures

## ✅ **Implemented Features**

- ✅ **Rich Text Editor** - React Quill for post creation with formatting toolbar
- ✅ **Advanced Search & Filtering** - Real-time search with category and sorting options
- ✅ **Post Categories & Tags** - Full category and tag management system
- ✅ **User Profile Management** - Profile editing and password change functionality
- ✅ **Comment System** - User comments on blog posts
- ✅ **Responsive Design** - Mobile-friendly UI across all devices
- ✅ **Role-Based Access Control** - Admin and Author permissions
- ✅ **Form Validation** - Comprehensive client-side validation
- ✅ **Error Handling** - Toast notifications and error boundaries
- ✅ **Production Build** - Optimized build ready for deployment

## 🚀 **Available Scripts**

### Frontend Scripts:
```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Auto-fix ESLint issues
```

### Backend Scripts:
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

## 🎯 **Future Enhancements**

- [ ] Image upload functionality for posts and profiles
- [ ] Email notifications for new posts and comments
- [ ] Social media sharing integration
- [ ] Comment threading and replies
- [ ] Post scheduling and publishing automation
- [ ] Analytics dashboard with post metrics
- [ ] Content moderation tools for admins
- [ ] API rate limiting and security enhancements
- [ ] Dark mode theme toggle
- [ ] Multi-language support (i18n)

---

**Happy blogging! 📝**
