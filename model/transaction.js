const mongoose=require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const transactions=mongoose.Schema({
transId:{type:String,required:true},
amount:{type:String,required:true},
_user:{type:mongoose.Types.ObjectId,required:true,ref:"users"},
_project:{type:mongoose.Types.ObjectId,required:true,ref:"projects"},
created_at:{type:Date,default: new Date()},
remainingPrice:{type:String,required:true}
})
transactions.plugin(aggregatePaginate)
mongoose.model('transactions',transactions)