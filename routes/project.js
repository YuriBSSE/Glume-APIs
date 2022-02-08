const express=require('express')
const router=express.Router()

const projectControllers=require('../controllers/projectController')
const verifyJWT= require('../middleware/jwtVerify').verifyJWT



router.post('/api/createProject',projectControllers.createProject)
router.post('/api/deleteProject',projectControllers.deleteProject)
router.get('/api/projects',projectControllers.projects)
router.post('/api/searchProjects',projectControllers.searchProjects)
router.post('/api/searchProjectsByDate',projectControllers.searchProjectsByDate)
router.post('/api/project',projectControllers.project)
router.post('/api/editProject',projectControllers.editProject)
router.post('/api/userProjects',projectControllers.userProjects)
router.post('/api/searchUserProjects',projectControllers.searchUserProjects)
router.post('/api/searchUserProjectsByDate',projectControllers.searchUserProjectsByDate)
router.post('/api/payOnProject',projectControllers.payOnProject)
router.get('/api/unPaidProjects',projectControllers.unPaidProjects)
router.post('/api/unPaidProjectsBySearch',projectControllers.unPaidProjectsBySearch)
router.post('/api/unPaidProjectsByDate',projectControllers.unPaidProjectsByDate)
router.post('/api/userUnPaidProjects',projectControllers.unPaidProjectsUser)
router.post('/api/userUnPaidProjectsBySearch',projectControllers.unPaidProjectsUserBySearch)
router.post('/api/userUnPaidProjectsByDate',projectControllers.unPaidProjectsUserByDate)
router.post('/api/markComplete',projectControllers.completeMark)
router.post('/api/sendBill',projectControllers.sendBill)









module.exports=router