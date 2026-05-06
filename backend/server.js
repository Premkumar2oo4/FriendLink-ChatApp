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

const server=app.listen(PORT,()=>{
    console.log("server connected at Point http://localhost:5000");
    
})
const io=require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000"
    },
});

io.on("connection",(socket)=>{
    console.log("connected to soket.io",socket.id);
    socket.on("setup",(userData)=>{
        socket.join(userData._id);
        console.log("User joined room",userData._id);
        socket.emit("connected")
    })
    socket.on("join chat",(room)=>{
        socket.join(room);
        console.log("User joined room",room);
    })
    socket.on('new message',(newMessageRecieved)=>{
        var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message received", newMessageRecieved);
    });
    })

    socket.on("typing",(room)=>socket.in(room).emit("typing",room).emit("typing"))
    socket.on("stop typing",(room)=>socket.in(room).emit("stop typing",room).emit("stop typing"))
    socket.off("setup",(userData)=>{
        console.log("User left room",userData._id);
        socket.leave(userData._id);
    })
})