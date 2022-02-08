const express=require('express')
const router=express.Router()
const mongoose=require('mongoose');
const commentController = require('../controllers/commentController');
const verifyJWT= require('../middleware/jwtVerify').verifyJWT


router.post('/api/addComment',commentController.addComment)
router.post('/api/comments',commentController.comments)

module.exports=router