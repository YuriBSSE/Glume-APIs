const express=require('express')
const router=express.Router()


const subscribtionControllers = require('../controllers/subscribtionControllers')
const verifyJWT= require('../middleware/jwtVerify').verifyJWT



router.post('/api/createSubscribtion',subscribtionControllers.createSubscribetion)
router.get('/api/subscribetion',subscribtionControllers.subscribetions)
router.post('/api/deleteSubscribtion',subscribtionControllers.deleteSubscribetion)
router.post('/api/editSubscribtion',subscribtionControllers.editSubscribetion)
router.post('/api/singleSubscrition',subscribtionControllers.singleSubscribtion)
router.post('/api/subscribePackage',subscribtionControllers.subscribe)
router.post('/api/userSubscribetions',subscribtionControllers.userSubscribetions)
router.post('/api/searchSubs',subscribtionControllers.searchSubs)
router.post('/api/searchSubsByDate',subscribtionControllers.searchSubsByDate)
router.post('/api/searchUserSubs',subscribtionControllers.userSubscribetionsSearch)
router.post('/api/searchUserSubsByDate',subscribtionControllers.userSubscribetionsSearchByDate)
router.post('/api/unSubscribe',subscribtionControllers.unSubscribe)




module.exports=router