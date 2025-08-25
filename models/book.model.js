const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    pages: {
        type: Number,
        required: true
    },
    history: [{
        type: String
    }],
    isBorrowed: {
        type: Boolean,
        default: false
    },
    borrowedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    borrowedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isPublished:{
        type:Boolean,
        default: false
    }
});

const bookLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Book = mongoose.model('Book', bookSchema);
const BookLog = mongoose.model('BookLog', bookLogSchema);

module.exports = { Book, BookLog };
