import { promisify } from "util"
import { Courses } from "../models/courses.js"
import { Lecture } from "../models/lecture.js"
import {rm} from 'fs'
import fs from 'fs'
import { User } from "../models/userModel.js"
export const createCourse = async (req , res)=>{
    try{

        const {title , description  , category  , createdBy , duration , price } = req.body

        const image = req.file

        await Courses.create({
            title,
            description,
            category ,
            createdBy,
            image  : image?.path,
            duration,
            price,
        })

        res.status(200).json({
            message : "Course Created successfully"
        })
    }catch(err){
        res.status(500).json({
            message : err.message
        })
    }
}

export const addLectures = async(req  , res)=>{
    try{
        const course = await Courses.findById(req.params.id)

        if(!course) return res.status(404).json({
            message : "No Courses With This Id"
        })

        const {title , description} =  req.body;

        const file = req.file

        const lecture = await Lecture.create({
            title ,
            description ,
            video : file?.path,
            course: course._id,
        })

        res.status(201).json({
            message : "Lecture Added",
            lecture,
        })
    }catch(err){
        res.status(500).json({
            message : err.message
        })
    }
}

export const deleteLecture = async(req , res) =>{
    try{
            const lecture = await Lecture.findById(req.params.id)
            rm(lecture.video , ()=>{
                console.log("video deleted")
            })

            await lecture.deleteOne()

            res.json({message : "Lecture Deleted"})
    }catch(err){
        res.status(500).json({
            message : err.message
        })
    }
}

const unlinkAsync = promisify(fs.unlink)
export const deleteCourse = async(req , res)=>{


    try{
            const course = await Courses.findById(req.params.id);

            const lectures = await Lecture.find( {course : course._id})

            await Promise.all(
                lectures.map(async(lecture)=>{
                            await  unlinkAsync(lecture.video);
                            console.log("videos Deleted")
                })

            )
            rm(course.image , ()=>{
                console.log("image Deleted")
            })
            
            await Lecture.find({course:req.params.id}).deleteMany()
            await course.deleteOne()
             await User.updateMany({} , {$pull : {subscription : req.params.id}})

             res.json({
                message : "Course Deleted"
             })
    }catch(err){
        res.status(500).json({
            message : err.message
        })
    }
}

export const getAllStats = async (req ,res)=>{

    const totalCourses = (await Courses.find()).length
    const totalLectures =  (await Lecture.find()).length
    const totalUsers = (await User.find()).length

    const stats = {
        totalCourses,
        totalLectures,
        totalUsers,
    }

    res.json({
            stats
    })
}

export const getMyCourses = async(req , res)=>{
    const courses = await Courses.find({_id : req.user.subscription})

    res.json({
        courses,
    })
}

export const getAllUsers = async (req  , res)=>{
    const users = await User.find({_id : {$ne:req.user.id}}).select("-password")
    res.json({users})
}

export const updateRole = async(req , res)=>{
    try{
    const user = await User.findById(req.params.id)

    if(user.role === "user"){
        user.role = "admin"
        await user.save()
    }

    res.status(200).json({
        message : "Role Updated To Admin"
    })
    if(user.role === "admin"){
        user.role = "user"
        await user.save()
    }

    res.status(200).json({
        message : "Role Updated "
    })


    }catch(err){
        res.status(500).json({
            message : err.message
        })
    }
}