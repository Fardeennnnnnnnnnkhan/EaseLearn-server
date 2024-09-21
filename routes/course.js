import express from 'express'
import { getAllCourses, getAllLectures, getSingleCourse, getSingleLecture } from '../controller/coursesController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router()

router.get('/all' , getAllCourses)
router.get('/:id' , getSingleCourse)
router.get('/lectures/:id' , isAuth , getAllLectures)
router.get('/lecture/:id' , isAuth , getSingleLecture)


export default router;