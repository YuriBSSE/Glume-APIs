const mongoose=require('mongoose')


const User=mongoose.model('users')

module.exports={
    getProfile: async function(req,res){
        try{
            const apiRes=await User.findById(req.body.id,{password:0})
            if(apiRes){
                res.send({message:"succussfully fetched",status:true,data:apiRes})
            }else{
                res.send({message:"no user exists",status:false})
            }
        }catch(err){
            res.send({message:"error",status:false,data:{error:err._message}})
        }
    },
}