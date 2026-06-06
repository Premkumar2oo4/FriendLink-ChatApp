require('dotenv').config()
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
const path= require('path')

connectDB()

app.use('/api/user',userRouter)
app.use('/api/chat',chatsRouter)
app.use('/api/message',messageRouter)

//---------------------Deployment----------------------------
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname1, "/frontend/dist")));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"));
    });
} else {
    app.get('/', (req, res) => {
        res.send("API is RUNNING SUCCESSFULLY");
    });
}
//---------------------Deployment----------------------------
app.use(notFound);
app.use(errorHandler) ;

const server=app.listen(PORT,()=>{
    console.log("server connected at Point http://localhost:5000");
    
})
const io=require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin:["http://localhost:3000", "http://localhost:5173"]
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

    socket.on("message read", ({ chatId, userId }) => {
        socket.in(chatId).emit("message read", { chatId, userId });
    });

    socket.on("message delivered", ({ messageId, chatId, userId }) => {
        socket.in(chatId).emit("message delivered", { messageId, chatId, userId });
    });

    socket.on("message edited", (updatedMessage) => {
        socket.in(updatedMessage.chat._id).emit("message edited", updatedMessage);
    });

    socket.on("message deleted", ({ messageId, chatId }) => {
        socket.in(chatId).emit("message deleted", { messageId, chatId });
    });

    socket.on("typing", (room) => socket.in(room).emit("typing", room));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

    socket.on("leave chat", (room) => {
        socket.leave(room);
        console.log("User left room", room);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
})