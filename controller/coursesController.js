import { Courses } from "../models/courses.js"
import { Lecture } from "../models/lecture.js"
import { User } from "../models/userModel.js"

export const getAllCourses = async (req , res)=>{
    try{

        const courses = await Courses.find()

        res.json({
            courses, 
        })
    }catch(err){
            res.status(404).json({
                message : err.message
            })
    }
}

export const getSingleCourse =  async (req , res)=>{
    try{

        const course = await Courses.findById(req.params.id)

        res.json({
            course, 
        })
    }catch(err){
            res.status(404).json({
                message : err.message
            })
    }
}

export const getAllLectures = async  (req , res)=>{
  try{
    let  lectures = await Lecture.find({course : req.params.id})
    
    let user = await User.findById(req.user._id)

    if(user.role === "admin"){
        return res.json({lectures})
    }
//Add this function when payment method is on
    // if(!user.subscription.includes(lectures.course)) return res.status(400).json({
    //     message : "No Dont have a Subscription"
    // })

    res.json({lectures})
  }catch(err){
    res.status(404).json({
        message : err.message
    })
  }
} 


export const getSingleLecture = async (req , res)=>{
    try{
        
        const lecture = await Lecture.findById(req.params.id)

let user = await User.findById(req.user._id)

    if(user.role === "admin"){
        return res.json({lecture})
    }
// Runs only when the payment issue is solved
    // if(!user.subscription.includes(req.params.id)) return res.status(400).json({
    //     message : "No Dont have a Subscription"
    // })

    res.json({lecture})
    }catch(err){
        res.status(500).json({
            message : err.message
        })

    }
}