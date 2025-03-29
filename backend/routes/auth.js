const User = require('../models/user');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

//register
router.post('/register', async (req, res) => {
    try{
        const {username ,email, password , name} = req.body;
        const MailCheck = await User.findOne({email});
        if(MailCheck){
            return res.status(400).json({message: 'Email already exists'});
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            name
        });
        const user = await newUser.save();
        res.status(200).json(user);
    }
    catch(err){
        res.status(500).json(err);
    }
});


//login
router.post('/login', async(req , res) => {
    try{
        const{username,email, password} = req.body;
        const UserNameCheck = await User.findOne({username});
        const EmailCheck = await User.findOne({email});
        if(!UserNameCheck && !EmailCheck){
            return res.status(400).json({message: 'User not found'});
        }

        const user = UserNameCheck || EmailCheck;

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });

    }
    catch(err){
        res.status(500).json({message: "Server error", error: err.message });
    }
    
})

module.exports = router;