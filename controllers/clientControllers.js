const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const fs = require('fs')
const nodemailer = require("nodemailer");
const credentialsEmail = require('../services/credentialsEmail');
const User = mongoose.model('users')
const saltRounds = 10;
const stripe= require("stripe")("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")
var plaid = require('plaid');
module.exports = {
    registerClient: async function (req, res) {
        bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
            try {
                // if (req.body.card?.cardNum) {
                //     const existUser = await User.findOne({ email: req.body.email })
                //     if (!existUser) {
                //     createCustomerProfile(req.body, async (response) => {
                //         if (response.getMessages().getResultCode() != "Error") {
                //                     await User({
                //                         ...req.body,
                //                         password: hash,
                //                         updated_at: new Date(),
                //                         created_at: new Date(),
                //                         role: 2,
                //                         card:req.body.card,
                //                         customerProfileId:response.customerProfileId,
                //                         customerPaymentProfileId:response.customerPaymentProfileIdList.numericString[0]

                //                     }).save()
                //                     res.send({ status: true, msg: "create Successfully" })
                //         } else {
                //             res.send({
                //                 status: false,
                //                 msg: response.getMessages().getMessage()[0].getText()
                //             })
                //         }
                //     })
                // } else {
                //     res.send({ status: false, msg: "user Already exists" })
                // }
                // } else {
                    const existUser = await User.findOne({ email: req.body.email })
                    if (!existUser) {

                        const customer = await stripe.customers.create({
                            email:req.body.email,
                            phone:req.body.number,
                            description: req.body.address
                          });

                        await User({
                            ...req.body,
                            password: hash,
                            updated_at: new Date(),
                            created_at: new Date(),
                            role: 2,
                            customerProfileId:customer.id
                        }).save()
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
                            from: 'getglume@gmail.com', // sender address
                            to: req.body.email, // list of receivers
                            subject: req.body.first_name+" "+req.body.last_name+" your glume account credentials", // Subject line
                            html: credentialsEmail(req.body.email,req.body.password), // html body
                        });
                        res.send({ status: true, msg: "create Successfully" })
                    } else {
                        res.send({ status: false, msg: "user Already exists" })
                    }
                // }
            } catch (err) {
                res.send({ status: false, msg: err.message })
            }
        })
    },
    deleteClient: async function (req, res) {
        
        if(req.body.customerProfileId || req.body.bankId){

                    try {
                        if(req.body.bankId){
                            const deleted = await stripe.customers.deleteSource(
                            req.body.customerProfileId,
                            req.body.bankId
                            );
                        }else{
                            const deleted = await stripe.customers.del(
                                req.body.customerProfileId,
                                req.body.customerPaymentProfileId
                              );
                        }
                        const data=await User.findByIdAndDelete(req.body.id)
                        if (data.image && data.image != "/uploads/default.jpeg") {
                            fs.unlinkSync("." + data.image)
                        }
                        res.send({ status: true, msg: "successfully Deleted",data })
                    } catch (err) {
                        res.send({ status: false, error: err.message })
                    }
        }else{
            try {
                const data=await User.findByIdAndDelete(req.body.id)
                if (data.image && data.image != "/uploads/default.jpeg") {
                    fs.unlinkSync("." + data.image)
                }
                res.send({ status: true, msg: "successfully Deleted",data })
            } catch (err) {
                res.send({ status: false, error: err.message })
            }
        }
    },
    editClientByAdmin:async function(req,res){
        bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
            try{
                const customer = await stripe.customers.update(
                    req.body.customerProfileId,
                    {
                        email:req.body.email,
                        phone:req.body.number,
                        description: req.body.address
                    }
                  );
                await User.findByIdAndUpdate(req.body.id, {...req.body,password:hash,customerProfileId:customer.id})
                res.send({ status: true, msg: "successfully Updated" })
            }catch(err){
                res.send({ status: false, msg: err.message })
            }
        })
    },
    editClient: async function (req, res) {
        if(req.body.editOnly){
            try {
                if (req.file) {
                    const user = await User.findById(req.body.id);
                    if (user.image && user.image != "/uploads/default.jpeg") {
                        fs.unlinkSync("." + user.image)
                    }

                    await User.findByIdAndUpdate(req.body.id, {
                        ...req.body,
                        image: "/" + req.file.path,
                        updated_at: new Date()
                        
                    })
                } else {
                    await User.findByIdAndUpdate(req.body.id, {
                        ...req.body,
                        updated_at: new Date()
                    })
                }
                return res.send({ status: true, msg: "successfully Updated" })
            } catch (err) {
                return res.send({ status: false, msg: err.message })
            }
        }
        else if(req.body.customerPaymentProfileId){
            // editCustomerProfile(req.body.customerProfileId,req.body.customerPaymentProfileId,req.body, async (response) => {
            //     if (response.getMessages().getResultCode() != "Error") {
                    try {
                        if (req.file) {
                            const user = await User.findById(req.body.id);
                            
                                if (user.image && user.image != "/uploads/default.jpeg") {
                                    // res.send("tue")
                                    fs.unlinkSync("." + user.image)
                                }

                                const deleted = await stripe.customers.deleteSource(
                                    req.body.customerProfileId,
                                    req.body.customerPaymentProfileId,
                                  );
                                  const card = await stripe.customers.createSource(
                                    req.body.customerProfileId,
                                    {source: req.body.token}
                                  );
                                  await User.findByIdAndUpdate(req.body.id, {
                                    ...req.body,
                                    image: "/" + req.file.path,
                                    updated_at: new Date(),
                                    customerPaymentProfileId:card.id
                                })
                        } 
                        else {

                            const deleted = await stripe.customers.deleteSource(
                                req.body.customerProfileId,
                                req.body.customerPaymentProfileId,
                                );
                            const card = await stripe.customers.createSource(
                                req.body.customerProfileId,
                                {source: req.body.token}
                                );
                            await User.findByIdAndUpdate(req.body.id, {
                                ...req.body,
                                updated_at: new Date(),
                                customerPaymentProfileId:card.id
                            })

                        }
                        return res.send({ status: true, msg: "successfully Updated" })
                    } catch (err) {
                        res.send({ status: false, msg:"something goes wrong" })
                    }
                // } 
            //     else {
            //         res.send({
            //             status: false,
            //             msg: response.getMessages().getMessage()[0].getText()
            //         })
            //     }
            // })
        }else{
            try {
                if (req.file) {
                    const user = await User.findById(req.body.id);
                    if (user.image && user.image != "/uploads/default.jpeg") {
                        fs.unlinkSync("." + user.image)
                    }

                    const card = await stripe.customers.createSource(
                        req.body.customerProfileId,
                        {source: req.body.token},
                      );

                    await User.findByIdAndUpdate(req.body.id, {
                        ...req.body,
                        image: "/" + req.file.path,
                        updated_at: new Date(),
                        customerPaymentProfileId:card.id
                        
                    })
                } else {
                    const card = await stripe.customers.createSource(
                        req.body.customerProfileId,
                        {source: req.body.token}
                      );
                    await User.findByIdAndUpdate(req.body.id, {
                        ...req.body,
                        updated_at: new Date(),
                        customerPaymentProfileId:card.id
                    })
                }
                res.send({ status: true, msg: "successfully Updated" })
            } catch (err) {
                res.send({ status: false, msg: err.message })
            }
        }
    },
    allClients: async function (req, res) {
        try {
            // const apiRes=await User.find({},{password:0}).lean()

            const userAgg = User.aggregate([
                {
                    $match: { role_id: 2 }
                },
                { $sort: { created_at: -1 } },
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalProjects'
                    }
                },
                {
                    $lookup: {
                        from: 'subscribetions',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalSubs'
                    }
                },
                { $addFields: { projects: { $size: "$totalProjects" } } },
                { $addFields: { subs: { $size: "$totalSubs" } } },
                {
                    $project: {
                        totalProjects: 0,
                        totalSubs: 0,
                        password: 0
                    }
                }
            ])
            const resp = await User.aggregatePaginate(userAgg, { limit: 10, page: req.query.page })
            res.send({ status: true, msg: "successfully Fetched", data: resp })
        } catch (err) {
            res.send({ status: false, error: err._message })
        }
    },
    searchClients: async function (req, res) {
        try {
            await User.collection.createIndex({ 'first_name': 'text', 'last_name': 'text', 'created_at': 'text', 'organization': 'text' })
            const userAgg = User.aggregate([
                {
                    $match: { 
                        role_id: 2, 
                        $or:[
                        {"first_name":{ $regex: req.body.text, $options: "i" }},
                        {"last_name":{ $regex: req.body.text, $options: "i" }},
                        {"organization":{ $regex: req.body.text, $options: "i" }}
                     ],
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalProjects'
                    }
                },
                {
                    $lookup: {
                        from: 'subscribetions',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalSubs'
                    }
                },
                { $addFields: { projects: { $size: "$totalProjects" } } },
                { $addFields: { subs: { $size: "$totalSubs" } } },
                {
                    $project: {
                        totalProjects: 0,
                        totalSubs: 0,
                        password: 0
                    }
                }
            ])
            const resp = await User.aggregatePaginate(userAgg, { limit: 10, page: req.query.page })
            res.send({ status: true, msg: "successfully Fetched", data: resp })
        } catch (err) {
            res.send({ status: false, error: err.message })
        }
    },
    searchClientsByDate: async function (req, res) {
        try {
            const userAgg = User.aggregate([
                {
                    $match: { role_id: 2, created_at: { $lte: new Date(req.body.date) } }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalProjects'
                    }
                },
                {
                    $lookup: {
                        from: 'subscribetions',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalSubs'
                    }
                },
                { $addFields: { projects: { $size: "$totalProjects" } } },
                { $addFields: { subs: { $size: "$totalSubs" } } },
                {
                    $project: {
                        totalProjects: 0,
                        totalSubs: 0,
                        password: 0
                    }
                }
            ])
            const resp = await User.aggregatePaginate(userAgg, { limit: 10, page: req.query.page })
            res.send({ status: true, msg: "successfully Fetched", data: resp })
        } catch (err) {
            res.send({ status: false, error: err.message })
        }
    },
    clientList: async function (req, res) {
        try {
            const apiRes = await User.find({role:2}, { _id: 1, first_name: 1, last_name: 1, customerProfileId: 1, customerPaymentProfileId: 1 })
            res.send({ status: true, msg: "successfully Fetched", data: apiRes.reverse() })
        } catch (err) {
            res.send({ status: false, error: err._message })
        }
    },
    clientLogin: async function (req, res) {
        const { email, password } = req.body
        try {
            const existUser = await User.findOne({ email, role_id: 2 }).lean()
            if (existUser) {
                bcrypt.compare(password, existUser.password, async function (err, result) {
                    if (result) {
                        res.send({
                            data: {...existUser,password:undefined},
                            message: "User login successfully.",
                            status: true
                        })
                    } else {
                        res.send({ message: "error", status: false, data: { error: 'Password is invalid' } })
                    }
                });
            } else {
                res.send({ message: "error", status: false, data: { error: 'Email is invalid' } })
            }
        } catch (err) {
            res.send({ message: "error", status: false, data: { error: err.message } })
        }
    },
    getClientCounts: async function(req,res){
        try{
            const apiRes=await User.aggregate([
                {$match:{_id:mongoose.Types.ObjectId(req.body.id)}},
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalProjects'
                    }
                },
                {
                    $lookup: {
                        from: 'subscribetions',
                        localField: '_id',
                        foreignField: '_user',
                        as: 'totalSubs'
                    }
                },
                { $addFields: { projects: { $size: "$totalProjects" } } },
                { $addFields: { subs: { $size: "$totalSubs" } } },
                {
                    $project: {
                        totalProjects: 0,
                        totalSubs: 0,
                        password: 0
                    }
                }
            ])
            if(apiRes){
                res.send({message:"succussfully fetched",status:true,data:apiRes[0]})
            }else{
                res.send({message:"no user exists",status:false})
            }
        }catch(err){
            res.send({message:"error",status:false,data:{error:err.message}})
        }
    },
    addBankAcount: async function (req, res) {
        if(req.body.bankId){
            try{
                const config=new plaid.Configuration({
                    basePath: plaid.PlaidEnvironments.development,
                    baseOptions: {
                      headers: {
                        'PLAID-CLIENT-ID': '61768ce144fc260012f974a5',
                        'PLAID-SECRET': '315632d41e2ed0f37b7f66e0656d9c',
                      },
                    },
                  })
                  const client = new plaid.PlaidApi(config)
                  const response = await client.itemPublicTokenExchange({ public_token:req.body.token });
                  const access_token = response.data.access_token;
                  const acResponse = await client.accountsGet({access_token});
                //   console.log(acResponse.data)
                  const request= {
                    access_token: access_token,
                    account_id: acResponse.data.accounts[0].account_id
                  };
                  const stripeTokenResponse = await client.processorStripeBankAccountTokenCreate(
                    request,
                  );
                  const bankAccountToken = stripeTokenResponse.data.stripe_bank_account_token
                  

                  const deleted = await stripe.customers.deleteSource(
                    req.body.customerProfileId,
                    req.body.bankId
                  );

                  const bankAccount = await stripe.customers.createSource(
                    req.body.customerProfileId,
                    {
                    source:bankAccountToken
                    }
                    );
                await User.findByIdAndUpdate(req.body.id,{bankId:bankAccount.id})
                res.send({status:true,msg:"successfully added"})
            }catch(err){
                res.send({status:false,msg:err.message})
            }
        }else{
            try{
                const config=new plaid.Configuration({
                    basePath: plaid.PlaidEnvironments.development,
                    baseOptions: {
                      headers: {
                        'PLAID-CLIENT-ID': '61768ce144fc260012f974a5',
                        'PLAID-SECRET': '315632d41e2ed0f37b7f66e0656d9c',
                      },
                    },
                  })
                  const client = new plaid.PlaidApi(config)
                  const response = await client.itemPublicTokenExchange({ public_token:req.body.token });
                  const access_token = response.data.access_token;
                  const acResponse = await client.accountsGet({access_token});
                //   console.log(acResponse.data)
                  const request= {
                    access_token: access_token,
                    account_id: acResponse.data.accounts[0].account_id
                  };
                  const stripeTokenResponse = await client.processorStripeBankAccountTokenCreate(
                    request,
                  );
                  const bankAccountToken = stripeTokenResponse.data.stripe_bank_account_token
                  const bankAccount = await stripe.customers.createSource(
                    req.body.customerProfileId,
                    {
                    source:bankAccountToken
                    }
                    );
                await User.findByIdAndUpdate(req.body.id,{bankId:bankAccount.id})
                res.send({status:true,msg:"successfully added"})
            }catch(err){
                res.send({status:false,msg:err.message})
            }
        }
    },
    getLinkToken: async function (req, res) {
       const config=new plaid.Configuration({
            basePath: plaid.PlaidEnvironments.development,
            baseOptions: {
              headers: {
                'PLAID-CLIENT-ID': '61768ce144fc260012f974a5',
                'PLAID-SECRET': '315632d41e2ed0f37b7f66e0656d9c',
              },
            },
          })
          const client = new plaid.PlaidApi(config)
            const response = await client.linkTokenCreate({
                user: {
                  client_user_id:req.body.userId,
                },
                client_name: req.body.name,
                products: ['auth'],
                country_codes: ['US'],
                language: 'en',
                webhook: 'https://sample.webhook.com'
              },);
              res.send({status:true,data:{linkToken:response.data.link_token}})
    },
}