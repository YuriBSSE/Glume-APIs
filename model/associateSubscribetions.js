const mongoose=require('mongoose');


const serviceSchema=mongoose.Schema({
    name:{type:String,required:true}
})

const AssociateSubscribetionsSchema=mongoose.Schema({
    name:{type:String,required:true},
    services:[serviceSchema],
    price:{type:Number,required:true},
    cycle:{type:Number,required:true},
    _project:{type:mongoose.Types.ObjectId,required:true,ref:"projects"},
    _user:{type:mongoose.Types.ObjectId,required:true,ref:"users"},
    subscribe:{type:Object,default:{}},
    priceId:{type:String,require:true},
    productId:{type:String,require:true},
    updated_at:{type:Date,default: new Date()},
    created_at:{type:Date,default: new Date()},
})

mongoose.model('associateSubscribetions',AssociateSubscribetionsSchema)