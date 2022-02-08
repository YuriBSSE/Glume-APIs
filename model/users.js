const mongoose=require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const usersSchema=new mongoose.Schema({
first_name:{type:String},
email:{type:String,required:true},
number:{type:String},
password:{type:String,required:true},
address:{type:String},
role_id:{type:Number,default:2},
image:{type:String,default:'/uploads/default.jpeg'},
updated_at:{type:Date,default: new Date()},
created_at:{type:Date,default: new Date()},
last_name:{type:String},
organization:{type:String},
customerProfileId:{type:String},
customerPaymentProfileId:{type:Object},
bankId:{type:String}
})
usersSchema.plugin(aggregatePaginate)
mongoose.model('users',usersSchema)