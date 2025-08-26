const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
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
        const foundUser = await User.findById(req.user.userId, '-password');
        if (!foundUser) {
            return res.status(404).send({
                message: 'User not found',
                status: 404
            });
        }

        res.send({
            message: 'User profile retrieved successfully',
            status: 200,
            user: {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email,
                createdAt: foundUser.createdAt
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email } = req.body;
        
        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ 
                email: email, 
                _id: { $ne: req.user.userId } 
            });
            if (existingUser) {
                return res.status(400).send({
                    message: 'Email already taken by another user',
                    status: 400
                });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { username, email },
            { new: true, select: '-password' }
        );
        
        if (!updatedUser) {
            return res.status(404).send({
                message: 'User not found',
                status: 404
            });
        }

        res.send({
            message: 'Profile updated successfully',
            status: 200,
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error updating profile',
            error: error.message
        });
    }
});

router.put('/makeAdmin/:id',auth,async(req,res)=>{
        console.log(req.user);
        
    const foundUser = await User.findById(req.user.userId, '-password');
    if (foundUser.isAdmin){
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
        const foundUser = await User.findById(req.user.userId, '-password');
        if (!foundUser.isAdmin) {
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
        const foundUser = await User.findById(req.user.userId, '-password');
        if (!foundUser.isAdmin) {
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
        const foundUser = await User.findById(req.user.userId, '-password');
        if (!foundUser.isAdmin) {
            return res.status(403).send({
                message: "Not authorized - Admin access required",
                status: 403
            });
        }
        
        // Prevent admin from deleting themselves
        if (req.params.id === req.user.userId) {
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
