# Library Management System

A modern full-stack library management application built with React, Node.js, Express, and MongoDB.

## Features

### Frontend (React)
- **Modern React Application** with hooks and context API
- **Responsive Design** with custom CSS and modern UI components
- **Authentication System** with JWT tokens
- **Dashboard** with statistics and recent activity
- **Book Management** - Browse, search, and filter books
- **Book Publishing** - Publish your own books to the library
- **User Profile** - Manage your account and view your books
- **Real-time Updates** - Dynamic book borrowing and returning

### Backend (Node.js/Express)
- **RESTful API** with Express.js
- **JWT Authentication** with middleware protection
- **MongoDB Database** with Mongoose ODM
- **Book Operations** - CRUD operations for books
- **User Management** - Registration, login, and profile management
- **Borrowing System** - Track book borrowing and returns
- **Admin Features** - Enhanced permissions for admin users

## Project Structure

```
library/
├── api/
│   └── index.js                 # Vercel serverless entry point
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Auth.jsx         # Authentication form
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── Books.jsx        # Book listing and management
│   │   │   ├── PublishBook.jsx  # Book publishing form
│   │   │   ├── Profile.jsx      # User profile page
│   │   │   └── Navbar.jsx       # Navigation component
│   │   ├── hooks/
│   │   │   └── useAuth.jsx      # Authentication context and hooks
│   │   ├── App.jsx              # Main application component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Styles
│   ├── package.json
│   └── vite.config.js
├── config/
│   └── database.js              # MongoDB connection
├── middlewares/
│   └── auth.middleware.js       # JWT authentication middleware
├── models/
│   ├── book.model.js           # Book and BookLog schemas
│   └── user.model.js           # User schema
├── routes/
│   ├── books.routes.js         # Book-related API routes
│   └── user.routes.js          # User-related API routes
├── app.js                      # Express app configuration
├── package.json               # Backend dependencies
└── vercel.json                # Vercel deployment configuration
```

## API Endpoints

### Authentication
- `POST /user/register` - Register a new user
- `POST /user/login` - Login user
- `GET /user/profile` - Get user profile (protected)

### Books
- `GET /book` - Get all published books (protected)
- `POST /book/publish` - Publish a new book (protected)
- `GET /book/published` - Get user's published books (protected)
- `GET /book/borrowed` - Get user's borrowed books (protected)
- `POST /book/borrow/:id` - Borrow a book (protected)
- `POST /book/return/:id` - Return a book (protected)

### Users
- `GET /user` - Get all users (admin only)

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Lucide React** - Modern icon library
- **Vite** - Fast build tool and development server
- **CSS Custom Properties** - Modern styling approach

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Deployment
- **Vercel** - Hosting platform for both frontend and backend
- **Serverless Functions** - Backend API as serverless functions

## Deployment on Vercel

This project is fully configured for deployment on Vercel with both frontend and backend.

### Prerequisites
1. A Vercel account
2. A MongoDB database (MongoDB Atlas recommended)
3. Environment variables configured

### Environment Variables
Set up the following environment variables in your Vercel dashboard:

```env
DB_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
```

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd library
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

### Vercel Configuration

The `vercel.json` file is already configured to:
- Deploy the Node.js API as serverless functions
- Build and serve the React frontend as static files
- Handle routing for both API and frontend routes

### Local Development

1. **Backend Development**
   ```bash
   # Set up environment variables in .env file
   echo "DB_URI=your-mongodb-uri" > .env
   echo "JWT_SECRET=your-secret" >> .env
   
   # Start backend server
   npm start
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` and proxy API requests to the backend.

## Features Walkthrough

### 1. Authentication
- Users can register with username, email, and password
- Secure login with JWT tokens
- Protected routes require authentication
- Persistent sessions with localStorage

### 2. Dashboard
- Overview of library statistics
- Recent books display
- Quick action buttons
- Responsive design for all screen sizes

### 3. Book Management
- Browse all published books
- Search by title or author
- Filter by availability status
- Borrow and return books with real-time updates

### 4. Publishing Books
- Simple form to publish new books
- Automatic publication status
- Input validation and error handling
- Success feedback

### 5. User Profile
- View and edit profile information
- Track published books
- Monitor borrowed books
- Book borrowing history

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Protected Routes** - Middleware protection for sensitive endpoints
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Proper cross-origin resource sharing

## Performance Optimizations

- **Code Splitting** - React lazy loading for better performance
- **Optimized Builds** - Vite for fast development and optimized production builds
- **Serverless Architecture** - Automatic scaling with Vercel functions
- **Static Asset Optimization** - Optimized CSS and JavaScript bundles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
