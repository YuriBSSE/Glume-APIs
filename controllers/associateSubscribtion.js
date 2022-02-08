const bcrypt=require('bcrypt')
const mongoose=require('mongoose')
const stripe= require("stripe")("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")

const AssociateSubscribetion=mongoose.model('associateSubscribetions')


module.exports={
    createAsSubscribetion: async function(req,res){
        try{
            const product = await stripe.products.create({
                name: req.body.name,
              });
            const price = await stripe.prices.create({
                unit_amount: Number(req.body.price*100),
                currency: 'usd',
                recurring: {interval: 'month',interval_count:Number(req.body.cycle)},
                product: product.id,
              });
            await AssociateSubscribetion({...req.body,priceId:price.id,productId:product.id}).save()
            res.send({status:true,msg:"successfully created"})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    assubscribetions: async function(req,res){
        try{
            const data = await AssociateSubscribetion.find({})
            res.send({status:true,msg:"successfully fetch",data:data.reverse()})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    deleteAsSubscribetion:async function(req,res){
        try{
            await AssociateSubscribetion.findByIdAndDelete(req.body.id)
            res.send({status:true,msg:"successfully deleted"})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    editAsSubscribetion:async function(req,res){
        try{

            const product = await stripe.products.create({
                name: req.body.name,
              });
            const price = await stripe.prices.create({
                unit_amount: Number(req.body.price*100),
                currency: 'usd',
                recurring: {interval: 'month',interval_count:Number(req.body.cycle)},
                product: product.id,
              });

            await AssociateSubscribetion.findByIdAndUpdate(req.body.id,{...req.body,priceId:price.id,productId:product.id})
            res.send({status:true,msg:"successfully updated"})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
    singleAsSub:async function(req,res){
        try{
            const data=await AssociateSubscribetion.findById(req.body.id).populate('_user')
            res.send({status:true,msg:"successfully Fetch",data})
        }catch(err){
            res.send({status:false,msg:err.message})
        }
    },
}