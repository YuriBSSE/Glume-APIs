const express=require('express')
const router=express.Router()

const categoryControllers = require('../controllers/categoryControllers')
const verifyJWT= require('../middleware/jwtVerify').verifyJWT

// router.post('/api/createCategory',verifyJWT,categoryControllers.createCategory)
router.post('/api/createCategory',categoryControllers.createCategory)
router.get('/api/categories',categoryControllers.categories)



module.exports=router