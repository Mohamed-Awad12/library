const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).send({ 
                message: "Not authorized - Admin access required",
                status: 403
            });
        }
        
        const users = await User.find({}, '-password');
        res.send({ message: "users", users: users });
    } catch (error) {
        res.status(500).send({ message: "Error fetching users", error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({
                message: 'User already exists',
                status: 400
            });
        }
        
        const newUser = new User({
            username,
            email,
            password
        });
        
        await newUser.save();
        
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET || 'Mohamed_Awad'
        );

        res.status(201).send({
            message: 'User registered successfully',
            status: 201,
            token: token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error registering user',
            error: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const foundUser = await User.findOne({ email: email });
        if (!foundUser) {
            return res.status(400).send({
                message: 'Invalid credentials',
                status: 400
            });
        }
        
        const isPasswordValid = await foundUser.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send({
                message: 'Invalid credentials',
                status: 400
            });
        }
        
        const token = jwt.sign(
            { userId: foundUser._id, email: foundUser.email },
            process.env.JWT_SECRET || 'Mohamed_Awad'
        );

        res.send({
            message: 'Login successful',
            status: 200,
            token: token,
            user: {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error during login',
            error: error.message
        });
    }
}); 

router.get('/profile', auth, async (req, res) => {
    try {
        // Since req.user now contains the full user object, we can use it directly
        const userData = {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
            isBlocked: req.user.isBlocked,
            createdAt: req.user.createdAt
        };
        
        res.send({ 
            message: "Profile retrieved successfully", 
            user: userData 
        });
    } catch (error) {
        res.status(500).send({ message: "Error retrieving profile", error: error.message });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email } = req.body;
        
        // Check if email is being changed and already exists
        if (email !== req.user.email) {
            const existingUser = await User.findOne({ 
                email: email,
                _id: { $ne: req.user._id } 
            });
            if (existingUser) {
                return res.status(400).send({ message: 'Email already in use by another user' });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { username, email },
            { new: true, select: '-password' }
        );

        const userData = {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isBlocked: updatedUser.isBlocked,
            createdAt: updatedUser.createdAt
        };

        res.send({ 
            message: "Profile updated successfully", 
            user: userData 
        });
    } catch (error) {
        res.status(500).send({ message: "Error updating profile", error: error.message });
    }
});

router.put('/makeAdmin/:id',auth,async(req,res)=>{
        console.log(req.user);
        
    if (req.user.isAdmin){
        newadmin = await User.updateOne({"_id":req.params.id},{$set:{isAdmin:true}})
        console.log(newadmin)
        newadmin.isAdmin = true
            res.send({
            message: 'User is admin successfully',
            status: 200,
        });
    }
    else{
          res.status(403).send({
            message: "Not authoraized",
            error: error.message
        });
    }

});

// Add user blocking field to schema first, then add routes
router.put('/block/:id', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).send({
                message: "Not authorized - Admin access required",
                status: 403
            });
        }
        
        const userToBlock = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true, select: '-password' }
        );
        
        if (!userToBlock) {
            return res.status(404).send({
                message: 'User not found',
                status: 404
            });
        }
        
        res.send({
            message: 'User blocked successfully',
            status: 200,
            user: userToBlock
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error blocking user',
            error: error.message
        });
    }
});

router.put('/unblock/:id', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).send({
                message: "Not authorized - Admin access required",
                status: 403
            });
        }
        
        const userToUnblock = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: false },
            { new: true, select: '-password' }
        );
        
        if (!userToUnblock) {
            return res.status(404).send({
                message: 'User not found',
                status: 404
            });
        }
        
        res.send({
            message: 'User unblocked successfully',
            status: 200,
            user: userToUnblock
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error unblocking user',
            error: error.message
        });
    }
});

router.delete('/delete/:id', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).send({
                message: "Not authorized - Admin access required",
                status: 403
            });
        }
        
        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).send({
                message: "Cannot delete your own account",
                status: 400
            });
        }
        
        const userToDelete = await User.findByIdAndDelete(req.params.id);
        
        if (!userToDelete) {
            return res.status(404).send({
                message: 'User not found',
                status: 404
            });
        }
        
        // Also delete all books by this user
        await Book.deleteMany({ author: userToDelete.username });
        
        res.send({
            message: 'User and their books deleted successfully',
            status: 200,
            deletedUser: {
                id: userToDelete._id,
                username: userToDelete.username,
                email: userToDelete.email
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error deleting user',
            error: error.message
        });
    }
});

module.exports = router;
