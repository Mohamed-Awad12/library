const express = require('express');
const { Book, BookLog } = require('../models/book.model');
const auth = require('../middlewares/auth.middleware');
const router = express.Router();
const User = require('../models/user.model');

router.post('/publish', auth, async (req, res) => {
    try {
        const { name, pages } = req.body;
        const foundUser = await User.findById(req.user.userId, '-password');
         console.log(foundUser);
        const bookData = new Book({
            author:foundUser.username,
            name,
            pages,
            history: [],
            isPublished: true  // Automatically publish the book
        });
        
        await bookData.save();
        
        res.status(200).send({
            message: "Book published successfully",
            status: 200,
            book: bookData
        });
    } catch (error) {
        res.status(500).send({
            message: "Error publishing book",
            error: error.message
        });
    }
});

router.get('/unpublished',auth,async (req,res)=>{
     const foundUser = await User.findById(req.user.userId, '-password');
    if(foundUser.isAdmin){
        try{
            const bookData = await Book.find({isPublished : false})
            res.status(200).send({
            message: "unpulished books retrived",
            status: 200,
            book: bookData
        });
        }catch{

        }
    }
})

router.get('/myBooks',auth,async (req,res)=>{
     
  
        try{
            const author = await User.findById(req.user.userId, '-password');
            const bookData = await Book.find({author : author.username})
            console.log(author)
            res.status(200).send({
            message: "books retrived",
            status: 200,
            book: bookData
        });
        }catch{
            res.status(500).send({
            message: "can't retrived",
            status: 500,
            book: bookData
        });
        }
    }
)

router.get('/unpublished/:id',auth,async (req,res)=>{
     const foundUser = await User.findById(req.user.userId, '-password');
    if(foundUser.isAdmin){
        try{
             await Book.updateOne({"_id":req.params.id},{$set:{isPublished :true}})
            res.status(200).send({
            message: "success",
            status: 200,

        });
        }catch{
            res.status(500).send({
            message: "cant publish",
            status: 500,

        });
        }
    }
})

router.get('/unpublish/:id',auth,async (req,res)=>{
     const foundUser = await User.findById(req.user.userId, '-password');
     const foundBook = await Book.findById(req.params.id,'-history')
    if(foundUser.username === foundBook.author){
        try{
             await Book.updateOne({"_id":req.params.id},{$set:{isPublished :false}})
            res.status(200).send({
            message: "success",
            status: 200,

        });
        }catch{
            res.status(500).send({
            message: "cant unpublish",
            status: 500,

        });
        }
    }
})


router.get("/", auth, async (req, res) => {
    try {
        // Return all published books for regular users, all books for admins
        const foundUser = await User.findById(req.user.userId, '-password');
        let books;
        
        if (foundUser.isAdmin) {
            books = await Book.find();
        } else {
            books = await Book.find({ isPublished: true });
        }
        
        res.send({
            message: "success",
            status: 200,
            books: books
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching books",
            error: error.message
        });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const {name, pages } = req.body;
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            {name, pages },
            { new: true }
        );
        
        if (!book) {
            return res.status(404).send({
                message: "Book not found",
                status: 404
            });
        }
        
        res.send({
            message: "Book updated successfully",
            data: book,
        });
    } catch (error) {
        res.status(500).send({
            message: "Error updating book",
            error: error.message
        });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).send({
                message: "Book not found",
                status: 404
            });
        }
        
        res.send({
            message: "Book deleted successfully",
            data: book,
        });
    } catch (error) {
        res.status(500).send({
            message: "Error deleting book",
            error: error.message
        });
    }
});

router.post('/borrow/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).send({
                message: "Book not found",
                status: 404
            });
        }
        
        if (book.isBorrowed) {
            return res.status(400).send({
                message: "Book is already borrowed by another user",
                status: 400
            });
        }
        
        book.isBorrowed = true;
        book.borrowedBy = req.user.userId;
        book.borrowedAt = new Date();
        
       
        book.history.push(`Borrowed by user ${req.user.userId} at ${new Date()}`);
        
        await book.save();
        
       
        const log = new BookLog({
            user: req.user.userId,
            from: new Date(),
            to: new Date()
        });
        await log.save();
        
        res.send({
            message: "Book borrowed successfully",
            status: 200,
            data: book
        });
    } catch (error) {
        res.status(500).send({
            message: "Error borrowing book",
            error: error.message
        });
    }
});

router.post('/return/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).send({
                message: "Book not found",
                status: 404
            });
        }
        
        if (!book.isBorrowed) {
            return res.status(400).send({
                message: "Book is not currently borrowed",
                status: 400
            });
        }
        
        if (book.borrowedBy.toString() !== req.user.userId) {
            return res.status(403).send({
                message: "You can only return books that you borrowed",
                status: 403
            });
        }
        
        book.isBorrowed = false;
        book.borrowedBy = null;
        book.borrowedAt = null;
        
        
        book.history.push(`Returned by user ${req.user.userId} at ${new Date()}`);
        
        await book.save();
        
        
        await BookLog.findOneAndUpdate(
            { user: req.user.userId, to: undefined },
            { to: new Date() }
        );
        
        res.send({
            message: "Book returned successfully",
            status: 200,
            data: book
        });
    } catch (error) {
        res.status(500).send({
            message: "Error returning book",
            error: error.message
        });
    }
});

router.get('/history/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).send({
                message: "Book not found",
                status: 404
            });
        }
        
        res.send({
            message: "Book history retrieved successfully",
            status: 200,
            data: book.history
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching book history",
            error: error.message
        });
    }
});

router.get('/user/history', auth, async (req, res) => {
    try {
        const userHistory = await BookLog.find({ user: req.user.userId });
        
        res.send({
            message: "User borrowing history retrieved successfully",
            status: 200,
            data: userHistory
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching user history",
            error: error.message
        });
    }
});

router.get('/user/current', auth, async (req, res) => {
    try {
        const currentBorrows = await Book.find({
            isBorrowed: true,
            borrowedBy: req.user.userId
        });
        
        res.send({
            message: "Currently borrowed books retrieved successfully",
            status: 200,
            data: currentBorrows
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching current borrows",
            error: error.message
        });
    }
});

// Add routes for frontend compatibility
router.get('/published', auth, async (req, res) => {
    try {
        const author = await User.findById(req.user.userId, '-password');
        const publishedBooks = await Book.find({
            author: author.username,
            isPublished: true
        });
        
        res.send({
            message: "Published books retrieved successfully",
            status: 200,
            books: publishedBooks
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching published books",
            error: error.message
        });
    }
});

router.get('/borrowed', auth, async (req, res) => {
    try {
        const borrowedBooks = await Book.find({
            isBorrowed: true,
            borrowedBy: req.user.userId
        }).populate('borrowedBy', 'username email');
        
        res.send({
            message: "Borrowed books retrieved successfully",
            status: 200,
            books: borrowedBooks
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching borrowed books",
            error: error.message
        });
    }
});

module.exports = router;

