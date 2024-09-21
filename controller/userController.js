import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../middleware/sendMail.js';

export const register = async (req, res) => {
    try {
        console.log('Request Body:', req.body); 
        const { name , email , password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User Already Exists" });

    
        const hashPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            name,
            email,
            password: hashPassword, // Store hashed password
        });

        // Generate OTP
        const otp = Math.floor(Math.random() * 100000);

        // Create activation token
        const activationToken = jwt.sign({ user, otp }, process.env.Activation_Token, {
            expiresIn: "2m"
        });
        // Email data
        const data = {
            name,
            otp,
        };

        // Send OTP email
        await sendMail(email, "E-Learning", data);

        // Send response
        res.status(200).json({
            message: "OTP SENT TO YOUR MAIL",
            activationToken,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
};


export const verifyUser = async (req, res) => {
    try {
        const { otp, activationToken } = req.body;
        const verify = jwt.verify(activationToken, process.env.Activation_Token);

        if (!verify) return res.status(400).json({ message: "OTP EXPIRED" });

        if (verify.otp !== otp) return res.status(400).json({ message: "Wrong OTP" });

        await User.create({
            name: verify.user.name,
            email: verify.user.email,
            password: verify.user.password
        });

        res.status(200).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const loginUser = async(req , res)=>{
    const {email , password} = req.body

    const user = await User.findOne({email})

    if(!user) return res.status(400).json({
        message : "No User with This Email"
    })

    const mathPassword = await bcrypt.compare(password , user.password)

    if(!mathPassword) return res.status(400).json({
        message : "wrong Password",
    })

    const token =  jwt.sign({_id : user._id } , process.env.Jwt_Sec , {
        expiresIn: "15d",
    } )

    res.json({
        message  : `Welcome back ${user.name}`,
        token ,
        user,
    })
}

export const myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        console.log('User from DB:', user); // Log user retrieved from DB

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (err) {
        console.error('Error in myProfile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
