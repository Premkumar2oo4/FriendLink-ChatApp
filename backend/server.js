const express=require('express')
const { chats } = require('./data/data')
const connectDB=require('./config/db')
const userRouter=require('./router/userRouter')
const chatsRouter=require('./router/chatsRouter')
const {notFound,errorHandler}=require('./middleware/errorhandler')
const messageRouter=require('./router/messageRouter')
const PORT = process.env.PORT || 5000
const app=express()
app.use(express.json())
require('dotenv').config()
connectDB()
app.get('/',(req,res)=>{
    res.send("HEllo world")
})
app.use('/api/user',userRouter)
app.use('/api/chat',chatsRouter)
app.use('/api/message',messageRouter)
app.use(notFound);
app.use(errorHandler) ;

app.listen(PORT,()=>{
    console.log("server connected at Point http://localhost:5000");
    
})