// app.js
const express = require('express');
const connectDB = require('./config/database');
const parser = require('body-parser');
const bookRouter = require('./routes/books.routes');
const userRouter = require('./routes/user.routes');

const app = express();

// connect DB (use env var from Vercel dashboard)
connectDB(process.env.DB_URI);

// middleware
app.use(parser.json());

// routes
app.use('/book', bookRouter);
app.use('/user', userRouter);

// health
app.get('/', (req, res) => {
    res.send('OK');
});

module.exports = app;
