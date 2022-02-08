const mongoose=require('mongoose')


const Project=mongoose.model('projects')


module.exports={
    addComment:async(req,res)=>{
        try{
            await Project.findByIdAndUpdate(req.body.id,{
                $push:{
                    "notes":{
                        text:req.body.text,
                        _user:req.body._user
                    }
                }
            })
            res.send({message:"succussfully Add Note",status:true})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    },
    comments:async(req,res)=>{
        try{
            const data=await Project.findById(req.body.id,{notes:1}).populate({
                path:'notes',
                populate:'_user'
            })
            res.send({message:"succussfully Add Note",status:true,data:data.notes})
        }catch(err){
            res.send({message:"error",status:false,data:err.message})
        }
    }
}