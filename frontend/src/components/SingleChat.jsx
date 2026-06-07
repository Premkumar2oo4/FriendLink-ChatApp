import {
    Box,
    FormControl,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Spinner,
    Text,
    useToast,
    Image,
    CloseButton,
} from "@chakra-ui/react";
import "./style.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = import.meta.env.VITE_API_URL || window.location.origin;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [fileUrl, setFileUrl] = useState("");
    const [fileType, setFileType] = useState("");
    const [filePreview, setFilePreview] = useState("");
    const fileInputRef = useRef(null);
    const socketRef = useRef();
    const selectedChatCompareRef = useRef();
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

    const postDetails = (file) => {
        setLoading(true);
        if (!file) {
            toast({
                title: "File not found",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }

        // Generate preview for images
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview("");
        }

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "FriendLink");
        data.append("cloud_name", "dsg8zyvhe");

        fetch("https://api.cloudinary.com/v1_1/dsg8zyvhe/auto/upload", {
            method: "POST",
            body: data,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    toast({
                        title: data.error.message,
                        status: "error",
                        duration: 4000,
                        isClosable: true,
                    });
                    setLoading(false);
                    return;
                }

                setFileUrl(data.secure_url);
                setFileType(file.type);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast({
                    title: "File upload failed",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                setLoading(false);
            });
    };

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

            if (socketRef.current) {
                socketRef.current.emit("join chat", selectedChat._id);
                socketRef.current.emit("message read", { chatId: selectedChat._id, userId: user._id });
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
        if ((event.type === "click" || event.key === "Enter") && (newMessage || fileUrl)) {
            if (socketRef.current) socketRef.current.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                const messageData = {
                    content: newMessage,
                    chatId: selectedChat._id,
                };

                if (fileUrl) {
                    messageData.fileUrl = fileUrl;
                    messageData.fileType = fileType;
                }

                setNewMessage("");
                setFileUrl("");
                setFileType("");
                setFilePreview("");

                const { data } = await axios.post(
                    "/api/message",
                    messageData,
                    config
                );
                if (socketRef.current) socketRef.current.emit("new message", data);
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
        socketRef.current = io(ENDPOINT);
        socketRef.current.emit("setup", user);
        socketRef.current.on("connected", () => setSocketConnected(true));
        socketRef.current.on("typing", () => setIsTyping(true));
        socketRef.current.on("stop typing", () => setIsTyping(false));

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user]);

    useEffect(() => {
        if (!socketRef.current) return;

        const messageReceivedHandler = (newMessageRecieved) => {
            if (
                !selectedChatCompareRef.current ||
                selectedChatCompareRef.current._id !== newMessageRecieved.chat._id
            ) {
                setNotification((prev) => {
                    if (!prev.find((n) => n._id === newMessageRecieved._id)) {
                        return [newMessageRecieved, ...prev];
                    }
                    return prev;
                });
                setFetchAgain(!fetchAgain);

                axios.put("/api/message/deliver", { chatId: newMessageRecieved.chat._id }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                }).then(() => {
                    if (socketRef.current) socketRef.current.emit("message delivered", { messageId: newMessageRecieved._id, chatId: newMessageRecieved.chat._id, userId: user._id });
                }).catch(err => console.log(err));
            } else {
                setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
                axios.put("/api/message/read", { chatId: selectedChatCompareRef.current._id }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                }).then(() => {
                    if (socketRef.current) socketRef.current.emit("message read", { chatId: selectedChatCompareRef.current._id, userId: user._id });
                }).catch(err => console.log(err));
            }
        };

        const messageEditedHandler = (updatedMessage) => {
            if (selectedChatCompareRef.current && selectedChatCompareRef.current._id === updatedMessage.chat._id) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
                );
            }
        };

        const messageDeletedHandler = ({ messageId, chatId }) => {
            if (selectedChatCompareRef.current && selectedChatCompareRef.current._id === chatId) {
                setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
            }
        };

        const messageReadHandler = ({ chatId, userId }) => {
            if (selectedChatCompareRef.current && selectedChatCompareRef.current._id === chatId) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => {
                        if (msg.sender._id === user._id) {
                            const hasRead = msg.readBy && msg.readBy.some(u => (u._id || u) === userId);
                            if (!hasRead) {
                                return {
                                    ...msg,
                                    readBy: [...(msg.readBy || []), { _id: userId }],
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
        };

        const messageDeliveredHandler = ({ chatId, userId }) => {
            if (selectedChatCompareRef.current && selectedChatCompareRef.current._id === chatId) {
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
        };

        socketRef.current.on("message received", messageReceivedHandler);
        socketRef.current.on("message edited", messageEditedHandler);
        socketRef.current.on("message deleted", messageDeletedHandler);
        socketRef.current.on("message read", messageReadHandler);
        socketRef.current.on("message delivered", messageDeliveredHandler);

        return () => {
            if (socketRef.current) {
                socketRef.current.off("message received", messageReceivedHandler);
                socketRef.current.off("message edited", messageEditedHandler);
                socketRef.current.off("message deleted", messageDeletedHandler);
                socketRef.current.off("message read", messageReadHandler);
                socketRef.current.off("message delivered", messageDeliveredHandler);
            }
        };
    }, [fetchAgain, setFetchAgain, user]);

    useEffect(() => {
        fetchMessages();

        if (selectedChat) {
            setNotification((prev) => prev.filter((n) => n.chat._id !== selectedChat._id));
        }

        if (socketRef.current && selectedChatCompareRef.current) {
            socketRef.current.emit("leave chat", selectedChatCompareRef.current._id);
        }
        selectedChatCompareRef.current = selectedChat;
    }, [selectedChat]);


    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            if (socketRef.current) socketRef.current.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                if (socketRef.current) socketRef.current.emit("stop typing", selectedChat._id);
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
                                        if (socketRef.current) socketRef.current.emit("message edited", updatedMsg);
                                    }}
                                    onMessageDeleted={(deletedMsgId) => {
                                        setMessages(messages.filter((msg) => msg._id !== deletedMsgId));
                                        if (socketRef.current) socketRef.current.emit("message deleted", { messageId: deletedMsgId, chatId: selectedChat._id });
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

                            {/* File Preview Area */}
                            {(filePreview || (fileUrl && !filePreview)) && (
                                <Box position="relative" mb={2} display="inline-block" maxW="200px">
                                    {fileType.startsWith("image/") || filePreview.startsWith("data:image") ? (
                                        <Image
                                            src={filePreview || fileUrl}
                                            alt="preview"
                                            borderRadius="md"
                                            maxH="150px"
                                            opacity={loading ? 0.6 : 1}
                                        />
                                    ) : (
                                        <Box p={3} bg="whiteAlpha.200" borderRadius="md" color="white">
                                            Document Ready
                                        </Box>
                                    )}
                                    {loading && <Spinner position="absolute" top="45%" left="45%" size="sm" color="cyan.400" />}
                                    <CloseButton
                                        position="absolute"
                                        top="-10px"
                                        right="-10px"
                                        bg="red.500"
                                        size="sm"
                                        borderRadius="full"
                                        onClick={() => {
                                            setFileUrl("");
                                            setFilePreview("");
                                            setFileType("");
                                        }}
                                    />
                                </Box>
                            )}

                            <InputGroup>
                                <Input
                                    variant="filled"
                                    bg="rgba(255, 255, 255, 0.08)"
                                    border="1px solid"
                                    borderColor="rgba(0, 229, 255, 0.2)"
                                    color="white"
                                    placeholder={fileUrl ? "Add a caption..." : "Type a message..."}
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
                                <InputRightElement width="4.5rem" display="flex" gap={1}>
                                    <IconButton
                                        icon={<AttachmentIcon />}
                                        size="sm"
                                        bg="transparent"
                                        color={fileUrl ? "cyan.400" : "whiteAlpha.600"}
                                        _hover={{ bg: "whiteAlpha.200", color: "cyan.300" }}
                                        onClick={() => fileInputRef.current.click()}
                                    />
                                    <IconButton
                                        icon={<ArrowForwardIcon />}
                                        size="sm"
                                        colorScheme="cyan"
                                        variant="ghost"
                                        isDisabled={!newMessage && !fileUrl}
                                        onClick={sendMessage}
                                        aria-label="Send Message"
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={(e) => postDetails(e.target.files[0])}
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                    </Box>
                </>
            ) : (
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
