const bcrypt=require('bcrypt')
const mongoose=require('mongoose')


const Project=mongoose.model('projects')
const User=mongoose.model('users')
const AssociateSubscribetion=mongoose.model('associateSubscribetions')
const Subscribetion=mongoose.model('subscribetions')
module.exports={
    getDashboard: async function(req,res){
        const {email,password}=req.body
        try{
            const users=await User.find({role_id:2}).count()
            const filter={}
            req.query.client?filter._user=mongoose.Types.ObjectId(req.query.client):null
            const projects=await Project.find(filter).count()
            const subs=await Subscribetion.find(filter).count()
            const assSub=await AssociateSubscribetion.find(filter).count()
            res.send({status:true,msg:'successfully fetch',data:{
                users,
                projects,
                assSub,
                subs
            }})
        }catch(err){
            res.send({message:"error",status:false,data:{error:err._message}})
        }
    }
}