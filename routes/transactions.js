const express=require('express')
const transactionController = require('../controllers/transactionController')
const router=express.Router()
const verifyJWT= require('../middleware/jwtVerify').verifyJWT






router.post('/api/transactions',transactionController.transactions)
router.post('/api/userTransactions',transactionController.userTransactions)
router.post('/api/transaction',transactionController.getTransaction)
router.post('/api/searchTransaction',transactionController.searchTransaction)
router.post('/api/searchTransactionByDate',transactionController.searchTransactionByDate)
router.post('/api/userSubsTrans',transactionController.subsTransactions)


module.exports=router