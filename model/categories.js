const mongoose=require('mongoose');


const subSchema=mongoose.Schema({
    name:{type:String,required:true}
})

const categorySchema=mongoose.Schema({
    name:{type:String,required:true},
    sub:[subSchema],
    status:{type:Number,default:1}
})

mongoose.model('categories',categorySchema)