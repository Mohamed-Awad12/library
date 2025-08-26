
const express = require('express');
const connectDB = require('./config/database');
const parser = require('body-parser');
const bookRouter = require('./routes/books.routes');
const userRouter = require('./routes/user.routes');

const app = express();

// Add error handling for database connection
connectDB(process.env.DB_URI).catch(err => {
  console.error('Database connection failed:', err);
});

app.use(parser.json());

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mount routes
app.use('/book', bookRouter);
app.use('/user', userRouter);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Add 404 handler for API routes
app.use('*', (req, res) => {
  console.log('Unmatched route:', req.originalUrl);
  res.status(404).json({ message: 'API route not found', path: req.originalUrl });
});

module.exports = app;
