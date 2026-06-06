import {
    Box,
    FormControl,
    IconButton,
    Input,
    Spinner,
    Text,
    useToast,
} from "@chakra-ui/react";
import "./style.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:5000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const toast = useToast();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    const { selectedChat, setSelectedChat, user, notification, setNotification } =
        ChatState();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            setMessages(data);
            setLoading(false);

            if (socket) {
                socket.emit("join chat", selectedChat._id);
                socket.emit("message read", { chatId: selectedChat._id, userId: user._id });
            }
        } catch (_error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );
                if (socket) socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (_error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        fetchMessages();

        if (selectedChat) {
            setNotification(notification.filter((n) => n.chat._id !== selectedChat._id));
        }

        if (socket && selectedChatCompare) {
            socket.emit("leave chat", selectedChatCompare._id);
        }
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);

                    // Mark as delivered since we received it in the background/another chat
                    axios.put("/api/message/deliver", { chatId: newMessageRecieved.chat._id }, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    }).then(() => {
                        socket.emit("message delivered", { messageId: newMessageRecieved._id, chatId: newMessageRecieved.chat._id, userId: user._id });
                    }).catch(err => console.log(err));
                }
            } else {
                setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
                // Automatically mark as read if user is viewing this chat
                axios.put("/api/message/read", { chatId: selectedChatCompare._id }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                }).then(() => {
                    socket.emit("message read", { chatId: selectedChatCompare._id, userId: user._id });
                }).catch(err => console.log(err));
            }
        });

        socket.on("message edited", (updatedMessage) => {
            if (selectedChatCompare && selectedChatCompare._id === updatedMessage.chat._id) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
                );
            }
        });

        socket.on("message deleted", ({ messageId, chatId }) => {
            if (selectedChatCompare && selectedChatCompare._id === chatId) {
                setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
            }
        });

        socket.on("message read", ({ chatId, userId }) => {
            if (selectedChatCompare && selectedChatCompare._id === chatId) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => {
                        if (msg.sender._id === user._id) {
                            const hasRead = msg.readBy && msg.readBy.some(u => (u._id || u) === userId);
                            if (!hasRead) {
                                return {
                                    ...msg,
                                    readBy: [...(msg.readBy || []), { _id: userId }],
                                    // If read, it is also delivered
                                    deliveredTo: msg.deliveredTo && msg.deliveredTo.some(u => (u._id || u) === userId)
                                        ? msg.deliveredTo
                                        : [...(msg.deliveredTo || []), { _id: userId }]
                                };
                            }
                        }
                        return msg;
                    })
                );
            }
        });

        socket.on("message delivered", ({ chatId, userId }) => {
            if (selectedChatCompare && selectedChatCompare._id === chatId) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => {
                        if (msg.sender._id === user._id) {
                            const hasDelivered = msg.deliveredTo && msg.deliveredTo.some(u => (u._id || u) === userId);
                            if (!hasDelivered) {
                                return {
                                    ...msg,
                                    deliveredTo: [...(msg.deliveredTo || []), { _id: userId }]
                                };
                            }
                        }
                        return msg;
                    })
                );
            }
        });

        return () => {
            socket.off("message received");
            socket.off("message edited");
            socket.off("message deleted");
            socket.off("message read");
            socket.off("message delivered");
        };
    });

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                        color="cyan.300"
                        fontWeight="600"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                            bg="transparent"
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                        />
                        {messages &&
                            (!selectedChat.isGroupChat ? (
                                <>
                                    {getSender(user, selectedChat.users)}
                                    <ProfileModal
                                        user={getSenderFull(user, selectedChat.users)}
                                    />
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchMessages={fetchMessages}
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                    />
                                </>
                            ))}
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="rgba(0, 0, 0, 0.25)"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                        border="1px solid rgba(255, 255, 255, 0.05)"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />
                        ) : (
                            <div className="messages">
                                <ScrollableChat
                                    messages={messages}
                                    onMessageEdited={(updatedMsg) => {
                                        setMessages(messages.map((msg) => msg._id === updatedMsg._id ? updatedMsg : msg));
                                        if (socket) socket.emit("message edited", updatedMsg);
                                    }}
                                    onMessageDeleted={(deletedMsgId) => {
                                        setMessages(messages.filter((msg) => msg._id !== deletedMsgId));
                                        if (socket) socket.emit("message deleted", { messageId: deletedMsgId, chatId: selectedChat._id });
                                    }}
                                />
                            </div>
                        )}

                        <FormControl
                            onKeyDown={sendMessage}
                            id="first-name"
                            isRequired
                            mt={3}
                        >
                            {istyping ? (
                                <div>
                                    <Lottie
                                        options={defaultOptions}
                                        // height={50}
                                        width={70}
                                        style={{ marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                            <Input
                                variant="filled"
                                bg="rgba(255, 255, 255, 0.08)"
                                border="1px solid"
                                borderColor="rgba(0, 229, 255, 0.2)"
                                color="white"
                                placeholder="Enter a message.."
                                _placeholder={{ color: "gray.400" }}
                                _hover={{
                                    bg: "rgba(255, 255, 255, 0.12)",
                                    borderColor: "rgba(0, 229, 255, 0.4)",
                                }}
                                _focus={{
                                    bg: "rgba(255, 255, 255, 0.15)",
                                    borderColor: "rgba(0, 229, 255, 0.8)",
                                    boxShadow: "0 0 5px rgba(0, 229, 255, 0.5)",
                                }}
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (
                // to get socket.io on same page
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans" color="whiteAlpha.700">
                        Click on a user to start chatting
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;