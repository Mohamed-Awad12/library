
const express = require('express');
const connectDB = require('./config/database');
require('dotenv').config()
const app = express();
const parser = require('body-parser');
const bookRouter = require('./routes/books.routes');
const userRouter = require('./routes/user.routes');


connectDB("mongodb+srv://awad123612:GoVMiCS9OjnGoxGH@cluster0.kfmkv9z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

app.use(parser.json());
app.use('/book', bookRouter);
app.use('/user', userRouter);



// app.listen(3001, (err) => {
//     if (err) {
//         console.error('Server error:', err);
//     } else {
//         console.log(`Server is running on port 3001....`);

//     }
// });

module.exports = app