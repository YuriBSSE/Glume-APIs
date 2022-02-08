const jwt=require('jsonwebtoken')
const keys=require('../config/keys')

 function verifyJWT(req,res,next){
    const {authorization}=req.headers
    try{
        jwt.verify(authorization,keys.jwtKey)
        next()
    }catch(err){
        res.send({status:false,msg:"required valid token"})
    }
}

module.exports={
    verifyJWT
}