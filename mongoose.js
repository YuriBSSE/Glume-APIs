const mongoose=require('mongoose');
const keys=require('./config/keys')

mongoose.connect(`mongodb+srv://glume:${keys.databasePassword}@cluster0.u0lkt.mongodb.net/glume?retryWrites=true&w=majority`,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex:false
}).then(()=>{
    console.log("connected to Database")
})