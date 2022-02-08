const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const cors=require('cors')
// add stripe
require('./mongoose')
require('./model/users')
require('./model/projects')
require('./model/categories')
require('./model/subscribetions')
require('./model/associateSubscribetions')
require('./model/transaction')

app.use(cors())

app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.use(require('./routes/auth'))
app.use(require('./routes/clients'))
app.use(require('./routes/project'))
app.use(require('./routes/category'))
app.use(require('./routes/subscribtion'))
app.use(require('./routes/associateSubscribtions'))
app.use(require('./routes/dashboard'))
app.use(require('./routes/transactions'))
app.use(require('./routes/comment'))

if(process.env.NODE_ENV==="production"){
    app.use(express.static('client/build'));
    const path=require('path');
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

app.listen(process.env.PORT || 5000,()=>{
    console.log("server is running")
})