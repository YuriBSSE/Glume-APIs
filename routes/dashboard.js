const express=require('express')
const dashboardControllers = require('../controllers/dashboardControllers')
const router=express.Router()
const verifyJWT= require('../middleware/jwtVerify').verifyJWT



router.get('/api/dashboard',dashboardControllers.getDashboard)



module.exports=router