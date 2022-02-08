const bcrypt=require('bcrypt')
var jwt = require('jsonwebtoken');
const mongoose=require('mongoose')
const keys=require('../config/keys')


const User=mongoose.model('users')
const saltRounds = 10;

module.exports={
    adminLogin: async function(req,res){
        const {email,password}=req.body
        try{
            const existUser=await User.findOne({email,role:1}).lean();
        if(existUser){
            bcrypt.compare(password, existUser.password, async function(err, result) {
                if(result){
                    var token=jwt.sign({email:email,password:password},keys.jwtKey,{expiresIn:60 * 60})
                    res.send({
                        data:{...existUser,token,password:undefined},
                        message:"User login successfully.",
                        status:true
                    })
                }else{
                    res.send({message:"error",status:false,data:{error:'Password is invalid'}})
                }
            });
        }else{
            res.send({message:"error",status:false,data:{error:'Email is invalid'}})
        }
        }catch(err){
            res.send({message:"error",status:false,data:{error:err._message}})
        }
    }
}