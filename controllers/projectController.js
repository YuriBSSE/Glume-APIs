const mongoose=require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const nodemailer = require("nodemailer");
const stripe= require("stripe")("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")
const makePayment=require('../services/makePayment').chargeCustomerProfile
const emailTemplate=require('../services/emailTemplate')

const AssociateSubscribetion=mongoose.model('associateSubscribetions')
const Project=mongoose.model('projects')
const User=mongoose.model('users')
const Transaction=mongoose.model('transactions')

module.exports={
    createProject: async function(req,res){
        try{
            const projectRes=await Project(req.body).save()
            res.send({message:"succussfully Created",status:true})
        }catch(err){
            res.send({message:err.message,status:false})
        }
    },
    deleteProject: async function(req,res){
        try{
            await Project.findByIdAndDelete(req.body.id)
            res.send({message:"succussfully Deleted",status:true})
        }catch(err){
            res.send({message:"error",status:false,data:"invalid id"})
        }
    },
    projects: async function(req,res){
        try{
            const filter={}
            req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
            const apiRes=await Project.paginate(filter,{limit:10,page:req.query.page,sort:{created_at:-1}})
            res.send({message:"succussfully fetched",status:true,data:apiRes})
        }catch(err){
            res.send({message:"error",status:false,data:err._message})
        }
    },
    searchProjects: async function(req,res){
        try{
            const filter={name:{$regex: req.body.text, $options: "i" }}
            req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
            const apiRes=await Project.paginate(filter,{limit:10,page:req.query.page})
            res.send({message:"succussfully fetched",status:true,data:apiRes})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    searchProjectsByDate: async function(req,res){
        try{
            const filter={created_at:{$lte:new Date(req.body.date)}}
            req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
            const apiRes=await Project.paginate(filter,{limit:10,page:req.query.page})
            res.send({message:"succussfully fetched",status:true,data:apiRes})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    project: async function(req,res){
        try{
            const apiRes=await Project.findById(req.body.id).populate('_user').populate({
                path:'notes',
                populate:'_user'
            }).lean()
            const asProject=await AssociateSubscribetion.find({_project:apiRes._id})
            res.send({message:"succussfully fetched",status:true,data:{...apiRes,asSub:asProject}})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    editProject: async function(req,res){
        try{
            const apiRes=await Project.findByIdAndUpdate(req.body.id,{
                ...req.body,
                updated_at:new Date()
            })
            res.send({message:"succussfully Updated",status:true})
        }catch(err){
            res.send({message:"error",status:false,data:err._message})
        }
    },
    userProjects: async function(req,res){
        try{
            const apiRes=await Project.paginate({_user:mongoose.Types.ObjectId(req.body.id)},{limit:req.body.limit,page:req.query.page,sort:{created_at:-1}})
            res.send({message:"succussfully fetch",status:true,data:apiRes})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    searchUserProjects: async function(req,res){
        try{
            const apiRes=await Project.paginate({
                _user:req.body.id,
                name:{$regex: req.body.text, $options: "i" }
            },{limit:10,page:req.query.page})
            res.send({message:"succussfully fetch",status:true,data:apiRes})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    searchUserProjectsByDate: async function(req,res){
        try{
            const apiRes=await Project.find({_user:req.body.id,created_at: { $lte: new Date(req.body.date) }})
            res.send({message:"succussfully fetch",status:true,data:apiRes})
        }catch(err){
            res.send({message:"error",status:false,data:err._message})
        }
    },
    payOnProject: async function(req,res){
        // makePayment(req.body.customerProfileId,req.body.customerPaymentProfileId,req.body,async(response)=>{
            if(req.body.customerPaymentProfileId || req.body.bankId){
                if(req.body.bankId){
                    const charge = await stripe.charges.create({
                        amount: Math.round(req.body.price*100),
                        currency: 'usd',
                        customer:req.body.customerProfileId,
                        source: req.body.bankId,
                        description: 'My payment',
                    });
                    const session=mongoose.startSession( { readPreference: { mode: "primary" } } );
                    (await session).startTransaction( { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } } )
                    try{
                        await Project.findByIdAndUpdate(req.body.id,{
                            $inc:{paidPrice:req.body.price}
                        })
                        await Transaction({
                            transId:charge.id,
                            amount:req.body.price,
                            _user:req.body._user,
                            _project:req.body.id,
                            remainingPrice:Math.round(req.body.remainingPrice-req.body.price)
                        }).save()
                        res.send({message:"succussfully Pay",status:true})
                    }catch(err){
                        (await session).abortTransaction()
                        throw err;
                    }
                    (await session).commitTransaction();
                    (await session).endSession()
                }else{
                    const charge = await stripe.charges.create({
                        amount: Math.round(req.body.price*100),
                        currency: 'usd',
                        customer:req.body.customerProfileId,
                        source: req.body.customerPaymentProfileId,
                        description: 'My payment',
                    });
                    const session=mongoose.startSession( { readPreference: { mode: "primary" } } );
                    (await session).startTransaction( { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } } )
                    try{
                        await Project.findByIdAndUpdate(req.body.id,{
                            $inc:{paidPrice:req.body.price}
                        })
                        await Transaction({
                            transId:charge.id,
                            amount:req.body.price,
                            _user:req.body._user,
                            _project:req.body.id,
                            remainingPrice:req.body.remainingPrice-req.body.price
                        }).save()
                        res.send({message:"succussfully Pay",status:true})
                    }catch(err){
                        (await session).abortTransaction()
                        throw err;
                    }
                    (await session).commitTransaction();
                    (await session).endSession()
                }
            }
            else{
                res.send({
                    status:false,
                    msg:"user not add card"
                })
            }
        // })
    },
    unPaidProjects: async function(req,res){
        try{
            const unPaid=Project.aggregate([
                {$match: {$expr: {$lt: ["$paidPrice", "$price"]}}},
                {
                    $lookup:{
                        from: 'users',
                        localField:'_user',
                        foreignField:'_id',
                        as: 'user'
                    }
                },
            ])
            const resp=await Project.aggregatePaginate(unPaid, {limit:10,page:req.query.page,sort:{created_at:-1}})
            res.send({message:"succussfully fetch",status:true,data:resp})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    unPaidProjectsUser: async function(req,res){
        try{
            const unPaid=Project.aggregate([
                {$match: {_user:mongoose.Types.ObjectId(req.body.id),$expr:{$lt: ["$paidPrice", "$price"]}}}
            ])
            const resp=await Project.aggregatePaginate(unPaid, {limit:10,page:req.query.page})
            res.send({message:"succussfully fetch",status:true,data:resp})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    unPaidProjectsBySearch: async function(req,res){
        try{
            const unPaid=Project.aggregate([
                {$match: {
                    $or:[
                        {"name":{ $regex: req.body.text, $options: "i" }},
                        {"category":{ $regex: req.body.text, $options: "i" }},
                        {"subCategory":{ $regex: req.body.text, $options: "i" }},
                     ],
                    $expr:{$lt: ["$paidPrice", "$price"]}}},
                    {
                        $lookup:{
                            from: 'users',
                            localField:'_user',
                            foreignField:'_id',
                            as: 'user'
                        }
                    },
            ])
            const resp=await Project.aggregatePaginate(unPaid, {limit:10,page:req.query.page})
            res.send({message:"succussfully fetch",status:true,data:resp})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    unPaidProjectsByDate: async function(req,res){
        try{
            const unPaid=Project.aggregate([
                {$match: {
                    created_at:{$lt:new Date(req.body.date)},
                    $expr:{$lt: ["$paidPrice", "$price"]}}},
                    {
                        $lookup:{
                            from: 'users',
                            localField:'_user',
                            foreignField:'_id',
                            as: 'user'
                        }
                    },
            ])
            const resp=await Project.aggregatePaginate(unPaid, {limit:10,page:req.query.page})
            res.send({message:"succussfully fetch",status:true,data:resp})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    unPaidProjectsUserBySearch: async function(req,res){
        try{
            const unPaid=Project.aggregate([
                {$match: {
                    $or:[
                        {"name":{ $regex: req.body.text, $options: "i" }},
                        {"category":{ $regex: req.body.text, $options: "i" }},
                        {"subCategory":{ $regex: req.body.text, $options: "i" }},
                     ],
                    _user:mongoose.Types.ObjectId(req.body.id),
                    $expr:{$lt: ["$paidPrice", "$price"]}}}
            ])
            const resp=await Project.aggregatePaginate(unPaid, {limit:10,page:req.query.page})
            res.send({message:"succussfully fetch",status:true,data:resp})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    unPaidProjectsUserByDate: async function(req,res){
        try{
            const unPaid=Project.aggregate([
                {$match: {
                    created_at:{$lt:new Date(req.body.date)},
                    _user:mongoose.Types.ObjectId(req.body.id),
                    $expr:{$lt: ["$paidPrice", "$price"]}}}
            ])
            const resp=await Project.aggregatePaginate(unPaid, {limit:10,page:req.query.page})
            res.send({message:"succussfully fetch",status:true,data:resp})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    completeMark: async function(req,res){
        try{
            await Project.findByIdAndUpdate(req.body.id,{
                status:0
            })
            res.send({message:"succussfully Mark",status:true})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    sendBill: async function(req,res){
        try{
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                service:'Gmail',
                secure: false, // true for 465, false for other ports,
                auth: {
                user: "getglume@gmail.com", // generated ethereal user
                pass: "bMcG8fdYZFa92CF*", // generated ethereal password
                clientId:"596091802169-igdfciqgobsab89di9aeh4l7cmgta0nu.apps.googleusercontent.com",
                clientSecret:"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"
                
            },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: "getglume@gmail.com", // sender address
                to: req.body.user[0].email, // list of receivers
                subject: req.body.name+" bill", // Subject line
                html: emailTemplate(req.body._id,req.body.remainingPrice,req.body.name,req.body.created_at,req.body.category,(req.body.user[0].first_name+" "+req.body.user[0].last_name)), // html body
            });

            // console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            res.send({message:"succussfully Mark",status:true})
        }catch(err){
            res.send({message:err.message,status:false})
        }
    },
}