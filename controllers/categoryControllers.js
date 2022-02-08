const bcrypt=require('bcrypt')
const mongoose=require('mongoose')


const Category=mongoose.model('categories')


module.exports={
    createCategory: async function(req,res){
        try{
            await Category(req.body).save()
            res.send({status:true,msg:"successfully Created"})
        }catch(err){
            res.send({message:"error",status:false,data:{error:err._message}})
        }
    },
    categories: async function(req,res){
        try{
            const apiRes=await Category.find({})
            res.send({status:true,msg:"successfully fetched",data:apiRes})
        }catch(err){
            res.send({message:"error",status:false,data:{error:err._message}})
        }
    }
}