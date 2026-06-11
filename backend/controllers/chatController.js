const asyncHandler=require('express-async-handler')
const User=require('../models/userModel')
const Chat=require('../models/chatModel')
const Message = require('../models/messageModel')
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
});
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;


    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
});
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
});

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    var users;
    try {
        users = typeof req.body.users === "string" ? JSON.parse(req.body.users) : req.body.users;
    } catch (error) {
        return res.status(400).send({ message: "Invalid users data format" });
    }

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
            chatPic: req.body.chatPic,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.body;

    const chat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $addToSet: { deletedBy: req.user._id },
        },
        {
            new: true,
        }
    );

    if (!chat) {
        res.status(404);
        throw new Error("Chat Not Found");
    }

    // Check if all participants have deleted the chat
    // For 1-on-1 chats, users.length is 2. For groups, it's >= 2.
    if (chat.deletedBy.length >= chat.users.length) {
        // Permanently delete messages and the chat
        await Message.deleteMany({ chat: chatId });
        await Chat.findByIdAndDelete(chatId);
        res.json({ message: "Chat and associated messages permanently deleted from database" });
    } else {
        res.json({ message: "Chat hidden for you" });
    }
});

const fetchChats = asyncHandler(async (req, res) => {
    try {
        let results = await Chat.find({
            users: { $elemMatch: { $eq: req.user._id } },
            deletedBy: { $ne: req.user._id }
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
        });
        
        res.status(200).send(results);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
const accessChat =asyncHandler(async (req,res)=>{
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        // If chat exists but was deleted by user, restore it
        if (isChat[0].deletedBy && isChat[0].deletedBy.includes(req.user._id)) {
            await Chat.findByIdAndUpdate(isChat[0]._id, {
                $pull: { deletedBy: req.user._id }
            });
            isChat[0].deletedBy = isChat[0].deletedBy.filter(id => id.toString() !== req.user._id.toString());
        }
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
})

module.exports = { deleteChat, addToGroup, removeFromGroup, renameGroup, createGroupChat, fetchChats, accessChat }