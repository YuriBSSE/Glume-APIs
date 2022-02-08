const express=require('express')
const router=express.Router()


const asSubscribtionControllers = require('../controllers/associateSubscribtion')



router.post('/api/createAsSubscribtion',asSubscribtionControllers.createAsSubscribetion)
router.get('/api/assubscribetion',asSubscribtionControllers.assubscribetions)
router.post('/api/deleteAsSubscribtion',asSubscribtionControllers.deleteAsSubscribetion)
router.post('/api/editAsSubscribtion',asSubscribtionControllers.editAsSubscribetion)
router.post('/api/singleAsSubscribtion',asSubscribtionControllers.singleAsSub)


module.exports=router