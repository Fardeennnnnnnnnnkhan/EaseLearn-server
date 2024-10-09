import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../middleware/sendMail.js';

export const register = async (req, res) => {
    try {
        console.log('Request Body:', req.body); 
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User Already Exists" });

        const hashPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(Math.random() * 100000);  // 5-digit OTP
        console.log("Generated OTP:", otp);

        // Create activation token with user details and OTP
        const activationToken = jwt.sign(
            { name, email, hashPassword, otp },  // Save the hashed password here
            process.env.Activation_Token,
            { expiresIn: "10m" }
        );

        // Email data (you can modify this structure)
        const data = {
            name,
            otp,
        };

        try {
            await sendMail(email, "E-Learning OTP Verification", data);
            console.log(`OTP email sent to ${email}`);
        } catch (emailErr) {
            console.error("Error sending email:", emailErr);
            return res.status(500).json({ message: "Error sending email" });
        }
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
        
        // Verify the JWT token
        const decoded = jwt.verify(activationToken, process.env.Activation_Token);

        // Check if token has expired or is invalid
        if (!decoded) return res.status(400).json({ message: "OTP EXPIRED" });

        const { name, email, hashPassword, otp: storedOtp } = decoded;

        // Verify OTP
        if (storedOtp !== otp) {
            return res.status(400).json({ message: "Wrong OTP" });
        }

        // Check if the user is already registered (to avoid duplication)
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User Already Registered" });

        // Finally, create the user after OTP is verified
        user = await User.create({
            name,
            email,
            password: hashPassword,  // Save the hashed password
        });

        res.status(200).json({ message: "User registered successfully" });

    } catch (err) {
        console.log(err);
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
