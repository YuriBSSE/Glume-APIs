const mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const notesSchema=mongoose.Schema({
    text:{type:String,required:true},
    _user:{type:mongoose.Types.ObjectId,require:true,ref:'users'},
    created_at:{type:Date,default:new Date()}
})

const projectsSchema=mongoose.Schema({
    _user:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'users'},
    name:{type:String,required:true},
    domain:{type:String},
    description:{type:String,required:true},
    price:{type:Number,required:true},
    paidPrice:{type:Number,default:0},
    category:{type:String,required:true},
    subCategory:{type:String},
    installmentType:{type:Number},
    noOfInstallments:{type:Number},
    updated_at:{type:Date,default: new Date()},
    created_at:{type:Date,default: new Date()},
    status:{type:Number,default:1},
    notes:[notesSchema]
})
// projectsSchema.index({'name': 'text','category':'text','subCategory':'text',"domain":"text"});
projectsSchema.plugin(mongoosePaginate)
projectsSchema.plugin(aggregatePaginate)
mongoose.model('projects',projectsSchema)