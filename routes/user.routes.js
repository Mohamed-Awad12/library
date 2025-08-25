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
            'Mohamed_Awad'
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
            'Mohamed_Awad'
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

module.exports = router;
