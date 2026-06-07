require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const userRouter = require('./router/userRouter')
const chatsRouter = require('./router/chatsRouter')
const { notFound, errorHandler } = require('./middleware/errorhandler')
const messageRouter = require('./router/messageRouter')
const PORT = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use('/api/user', userRouter)
app.use('/api/chat', chatsRouter)
app.use('/api/message', messageRouter)


app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`server connected at http://localhost:${PORT}`);

})
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    },
});

io.on("connection", (socket) => {
    console.log("connected to soket.io", socket.id);
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log("User joined room", userData._id);
        socket.emit("connected")
    })
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room", room);
    })
    socket.on('new message', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id.toString() === newMessageRecieved.sender._id.toString()) return;

            socket.in(user._id.toString()).emit("message received", newMessageRecieved);
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