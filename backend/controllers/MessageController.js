const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
        // Mark all messages from other users in this chat as read and delivered by current user
        await Message.updateMany(
            {
                chat: req.params.chatId,
                sender: { $ne: req.user._id },
                deliveredTo: { $ne: req.user._id },
            },
            { $addToSet: { deliveredTo: req.user._id } }
        );

        await Message.updateMany(
            {
                chat: req.params.chatId,
                sender: { $ne: req.user._id },
                readBy: { $ne: req.user._id },
            },
            { $addToSet: { readBy: req.user._id } }
        );

        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("readBy", "name pic email")
            .populate("deliveredTo", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };
  
    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Edit Message
//@route           PUT /api/Message/:messageId
//@access          Protected
const editMessage = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { messageId } = req.params;

    if (!content) {
        res.status(400);
        throw new Error("Content is required to edit message");
    }

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404);
            throw new Error("Message not found");
        }

        // Check if current user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("You are not authorized to edit this message");
        }

        // Check if message has been read by anyone else
        if (message.readBy && message.readBy.length > 0) {
            res.status(400);
            throw new Error("Cannot edit message as it has already been read");
        }

        message.content = content;
        await message.save();

        var updatedMessage = await Message.findById(messageId)
            .populate("sender", "name pic email")
            .populate("chat");
        
        updatedMessage = await User.populate(updatedMessage, {
            path: "chat.users",
            select: "name pic email",
        });

        res.json(updatedMessage);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Delete Message
//@route           DELETE /api/Message/:messageId
//@access          Protected
const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404);
            throw new Error("Message not found");
        }

        // Check if current user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("You are not authorized to delete this message");
        }

        // Check if message has been read by anyone else
        if (message.readBy && message.readBy.length > 0) {
            res.status(400);
            throw new Error("Cannot delete message as it has already been read");
        }

        const chatId = message.chat;

        await Message.findByIdAndDelete(messageId);

        // Update latestMessage if this was the latest message
        const chat = await Chat.findById(chatId);
        if (chat && chat.latestMessage && chat.latestMessage.toString() === messageId) {
            // Find the new latest message
            const newLatest = await Message.findOne({ chat: chatId }).sort({ createdAt: -1 });
            await Chat.findByIdAndUpdate(chatId, { latestMessage: newLatest || null });
        }

        res.json({ message: "Message deleted successfully", messageId, chatId });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Mark Messages as Read
//@route           PUT /api/Message/read
//@access          Protected
const markAsRead = asyncHandler(async (req, res) => {
    const { chatId } = req.body;

    if (!chatId) {
        res.status(400);
        throw new Error("Chat ID is required");
    }

    try {
        await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: req.user._id },
                readBy: { $ne: req.user._id },
            },
            { $addToSet: { readBy: req.user._id } }
        );
        res.json({ message: "Messages marked as read" });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Mark Messages as Delivered
//@route           PUT /api/Message/deliver
//@access          Protected
const markAsDelivered = asyncHandler(async (req, res) => {
    const { chatId } = req.body;

    if (!chatId) {
        res.status(400);
        throw new Error("Chat ID is required");
    }

    try {
        await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: req.user._id },
                deliveredTo: { $ne: req.user._id },
            },
            { $addToSet: { deliveredTo: req.user._id } }
        );
        res.json({ message: "Messages marked as delivered" });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage, editMessage, deleteMessage, markAsRead, markAsDelivered };