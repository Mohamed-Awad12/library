const mongoose = require('mongoose');

// Cache connection across invocations in serverless
let isConnected = false;

const connectDB = async (uri) => {
    if (!uri) {
        throw new Error('DB_URI is not defined');
    }
    if (isConnected) {
        return mongoose.connection;
    }
    try {
        await mongoose.connect(uri, {
            dbName: 'bookDB',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 20000,
        });
        isConnected = true;
        return mongoose.connection;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
