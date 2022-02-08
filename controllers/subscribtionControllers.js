const bcrypt=require('bcrypt')
const mongoose=require('mongoose')

const subscribePackage=require('../services/subscribe').createSubscriptionFromCustomerProfile
const unSubscribePackage=require('../services/cancelSubscription').cancelSubscription
const Subscribetion=mongoose.model('subscribetions')
const User=mongoose.model('users')
const AssociateSubscribetion=mongoose.model('associateSubscribetions')
const stripe= require("stripe")("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")

module.exports={
    createSubscribetion: async function(req,res){
        try{
            const product = await stripe.products.create({
                name: req.body.name,
              });
            const price = await stripe.prices.create({
                unit_amount: Math.round(req.body.price*100),
                currency: 'usd',
                recurring: {interval: 'month',interval_count:Number(req.body.cycle)},
                product: product.id,
              });
            await Subscribetion({...req.body,priceId:price.id,productId:product.id}).save()
            res.send({status:true,msg:"successfully created"})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    subscribetions: async function(req,res){
        try{
            const filter={}
            req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
            const data = await Subscribetion.paginate(filter,{limit:10,page:req.query.page,sort:{created_at:-1}})
            res.send({status:true,msg:"successfully fetch",data:data})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    searchSubs: async function(req,res){
        try{
            const filter={
                name:{$regex: req.body.text, $options: "i" }
            }
            req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
            const data = await Subscribetion.paginate(filter,{limit:10,page:req.query.page})
            res.send({status:true,msg:"successfully fetch",data:data})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    searchSubsByDate: async function(req,res){
        try{
            const filter={created_at:{$lte:new Date(req.body.date)}}
            req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
            const data = await Subscribetion.paginate(filter,{limit:10,page:req.query.page})
            res.send({status:true,msg:"successfully fetch",data:data})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    userSubscribetions: async function(req,res){
        try{
            const data = await Subscribetion.paginate({_user:mongoose.Types.ObjectId(req.body.id)},{limit:req.body.limit,page:req.query.page,sort:{created_at:-1}})
            res.send({status:true,msg:"successfully fetch",data:data})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    userSubscribetionsSearch: async function(req,res){
        try{
            const data = await Subscribetion.paginate({
                _user:mongoose.Types.ObjectId(req.body.id),
                name:{$regex: req.body.text, $options: "i" }
                },{limit:10,page:req.query.page})
            res.send({status:true,msg:"successfully fetch",data:data})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    userSubscribetionsSearchByDate: async function(req,res){
        try{
            const data = await Subscribetion.paginate({_user:mongoose.Types.ObjectId(req.body.id),created_at:{$lte:new Date(req.body.date)}},{limit:10,page:req.query.page})
            res.send({status:true,msg:"successfully fetch",data:data})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    deleteSubscribetion:async function(req,res){
        try{
            await Subscribetion.findByIdAndDelete(req.body.id)
            res.send({status:true,msg:"successfully deleted"})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    editSubscribetion:async function(req,res){
        try{
            await Subscribetion.findByIdAndUpdate(req.body.id,req.body)
            res.send({status:true,msg:"successfully updated"})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    singleSubscribtion:async function(req,res){
        try{
            const data=await Subscribetion.findById(req.body.id).lean();
            const userInfo=await User.findById(data._user,{password:0})
            res.send({status:true,msg:"successfully fetch",data:{...data,userInfo}})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    subscribe:async function(req,res){
        // subscribePackage(req.body.customerProfileId,req.body.customerPaymentProfileId,req.body,async(response)=>{
            if(req.body.customerPaymentProfileId || req.body.bankId){
                if(req.body.bankId){
                    const subscription = await stripe.subscriptions.create({
                        customer: req.body.customerProfileId,
                        collection_method:"send_invoice",
                        days_until_due:req.body.cycle*30,
                        payment_settings:{
                            payment_method_types:["ach_credit_transfer"]
                        },
                        items: [
                          {price: req.body.priceId},
                        ],
                      });
                    const data={
                        subscriptionId:subscription.id,
                        amount:req.body.amount,
                        cycle:req.body.cycle,
                        date:req.body.date
                    }
                    if(req.body.asso){
                        await AssociateSubscribetion.findByIdAndUpdate(req.body.id,{
                            subscribe:data
                        })
                        res.send({status:true,msg:'successfully Subscribe'})
                    }else{
                        await Subscribetion.findByIdAndUpdate(req.body.id,{
                            subscribe:data
                        })
                        res.send({status:true,msg:'successfully Subscribe'})
                    }
                }else{
                    const subscription = await stripe.subscriptions.create({
                        customer: req.body.customerProfileId,
                        default_payment_method:req.body.customerPaymentProfileId,
                        items: [
                          {price: req.body.priceId},
                        ],
                      });
                    const data={
                        subscriptionId:subscription.id,
                        amount:req.body.amount,
                        cycle:req.body.cycle,
                        date:req.body.date
                    }
                    if(req.body.asso){
                        await AssociateSubscribetion.findByIdAndUpdate(req.body.id,{
                            subscribe:data
                        })
                        res.send({status:true,msg:'successfully Subscribe'})
                    }else{
                        await Subscribetion.findByIdAndUpdate(req.body.id,{
                            subscribe:data
                        })
                        res.send({status:true,msg:'successfully Subscribe'})
                    }
                }
            }else{
                res.send({
                    status:false,
                    msg:"user not add card"
                })
            }
        // })
    },
    unSubscribe:async function(req,res){
        const deleted = await stripe.subscriptions.del(
            req.body.subscriptionId
            );
        await Subscribetion.findByIdAndUpdate(req.body.id,{
            subscribe:false
        })
        res.send({status:true,msg:'successfully unSubscribe'})
    },
}