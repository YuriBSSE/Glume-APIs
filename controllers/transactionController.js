const bcrypt=require('bcrypt')
const mongoose=require('mongoose')
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const userSubTrans=require('../services/userSubTrans').getSubscription
const stripe= require("stripe")("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")

const Transaction=mongoose.model('transactions')
const User=mongoose.model('users')
const Project=mongoose.model('projects')

module.exports={
    transactions: async function(req,res){
       try{
        const filter=[
            {$lookup:{
                from:"users",
                localField:"_user",
                foreignField:"_id",
                as:'user'
            }},
            {$lookup:{
                from:"projects",
                localField:"_project",
                foreignField:"_id",
                as:'project'
            }}
        ]
        req.query.client?filter.push({$match:{_user:mongoose.Types.ObjectId(req.query.client)}}):null
        const tranAgg=Transaction.aggregate(filter)
        const resp=await Transaction.aggregatePaginate(tranAgg, {limit:10,page:req.query.page,sort:{_id:-1}})
        const updatedData=resp.docs.map(item=>({
            ...item,
            user:{...item.user[0]},
            project:{...item.project[0]}
        }))
        res.send({status:true,msg:"successfully fetch",data:{...resp,docs:updatedData}})
       }
       catch(err){
        res.send({status:false,msg:err.message})
       }
    },
    userTransactions:async function(req,res){
        try{
         const apiRes=await Transaction.aggregate([
             {$match:{_user:mongoose.Types.ObjectId(req.body.id)}},
             {$lookup:{
                 from:"users",
                 localField:"_user",
                 foreignField:"_id",
                 as:'user'
             }},
             {$lookup:{
                 from:"projects",
                 localField:"_project",
                 foreignField:"_id",
                 as:'project'
             }}
         ])
         const updatedData=apiRes.map(item=>({
             ...item,
             user:{...item.user[0]},
             project:{...item.project[0]}
         }))
         res.send({status:true,msg:"successfully fetch",data:updatedData})
        }
        catch(err){
         res.send({status:false,msg:err.message})
        }
     },
     getTransaction:async function(req,res){
        try{
            const transaction=await Transaction.findById(req.body.id).lean();
            const project=await Project.findById(transaction._project)
            const user=await User.findById(transaction._user)

            res.send({status:true,msg:"successfully fetch",data:{...transaction,project,user}})
           }
           catch(err){
            res.send({status:false,msg:err.message})
           }
     },
     searchTransaction: async function(req,res){
        try{
            const filter={
                $or:[
                   {"amount":{ $regex: req.body.text, $options: "i" }},
                   {"user.first_name":{ $regex: req.body.text, $options: "i" }},
                   {"user.last_name":{ $regex: req.body.text, $options: "i" }},
                   {"project.name":{ $regex: req.body.text, $options: "i" }},
                ]
            }
            req.query.client?filter['_user']=mongoose.Types.ObjectId(req.query.client):null
         const tranAgg=Transaction.aggregate([
             {$lookup:{
                 from:"users",
                 localField:"_user",
                 foreignField:"_id",
                 as:'user'
             }},
             {$lookup:{
                 from:"projects",
                 localField:"_project",
                 foreignField:"_id",
                 as:'project'
             }},
             {$match:filter}
         ])
         const resp=await Transaction.aggregatePaginate(tranAgg, {limit:10,page:req.query.page})
         const updatedData=resp.docs.map(item=>({
             ...item,
             user:{...item.user[0]},
             project:{...item.project[0]}
         }))
         res.send({status:true,msg:"successfully fetch",data:{...resp,docs:updatedData}})
        }
        catch(err){
         res.send({status:false,msg:err.message})
        }
     },
     searchTransactionByDate: async function(req,res){
        try{
        const filter={created_at: { $lte: new Date(req.body.date) }}
        req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
         const tranAgg=Transaction.aggregate([
             {$lookup:{
                 from:"users",
                 localField:"_user",
                 foreignField:"_id",
                 as:'user'
             }},
             {$lookup:{
                 from:"projects",
                 localField:"_project",
                 foreignField:"_id",
                 as:'project'
             }},
             { $match:filter}
         ])
         const resp=await Transaction.aggregatePaginate(tranAgg, {limit:10,page:req.query.page})
         const updatedData=resp.docs.map(item=>({
             ...item,
             user:{...item.user[0]},
             project:{...item.project[0]}
         }))
         res.send({status:true,msg:"successfully fetch",data:{...resp,docs:updatedData}})
        }
        catch(err){
         res.send({status:false,msg:err.message})
        }
     },
     subsTransactions: async function(req,res){
        try{
            const invoices = await stripe.invoices.list({
                subscription:req.body.subscriptionId,
                customer:req.body.customerProfileId
              });
              res.send(invoices)
        }catch(err){
            res.send({status:false,msg:err.message})
        }
     },
}