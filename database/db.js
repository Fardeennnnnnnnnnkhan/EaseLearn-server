import mongoose from 'mongoose';

export const connectDb= async ()=>{

try{

    mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DataBase")
}catch(err){
res.send(err.message);
}
}