import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
    try {
        // Get the token from headers
        const token = req.headers.token;
        
        // Check if token is not provided
        if (!token) {
            return res.status(403).json({ message: "Please Login" });
        }

        // Verify token
        const decodedData = jwt.verify(token, process.env.Jwt_Sec);

        // Find user by decoded ID
        req.user = await User.findById(decodedData._id);

        // Pass control to the next middleware or route handler
        next();
    } catch (err) {
        res.status(400).json({ message: "Login First" });
    }
};


export const isAdmin =(req , res , next)=>{
try{
      if(req.user.role !== "admin") return res.status(403).json({
        message : "You Are Not Admin"
      })
      next();
}catch(err){
    res.status(400).json({ message: "Login First" });
    
}
}