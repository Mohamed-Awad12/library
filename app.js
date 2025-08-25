
const express = require('express');
const connectDB = require('./config/database');
const parser = require('body-parser');
const bookRouter = require('./routes/books.routes');
const userRouter = require('./routes/user.routes');

const app = express();

connectDB(process.env.DB_URI);

app.use(parser.json());


app.use('/book', bookRouter);
app.use('/user', userRouter);



module.exports = app;
