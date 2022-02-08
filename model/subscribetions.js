const mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const serviceSchema=mongoose.Schema({
    name:{type:String,required:true}
})

const subscribetionSchema=mongoose.Schema({
    name:{type:String,required:true},
    services:[serviceSchema],
    price:{type:Number,required:true},
    cycle:{type:Number,required:true},
    _user:{type:mongoose.Types.ObjectId,required:true},
    subscribe:{type:Object,default:{}},
    priceId:{type:String,require:true},
    productId:{type:String,require:true},
    updated_at:{type:Date,default: new Date()},
    created_at:{type:Date,default: new Date()},
})

subscribetionSchema.index({'name': 'text','created_at':'text'});
subscribetionSchema.plugin(mongoosePaginate)
mongoose.model('subscribetions',subscribetionSchema)