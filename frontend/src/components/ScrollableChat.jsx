import { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
    isLastMessage,
    isSameSender,
    isSameSenderMargin,
    isSameUser,
    isNewDay,
    getChatDate,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { Avatar, Tooltip, Box, IconButton, Input, useToast } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon, ViewIcon, ExternalLinkIcon, DownloadIcon } from "@chakra-ui/icons";
import axios from "axios";

const ScrollableChat = ({ messages, onMessageEdited, onMessageDeleted }) => {
    const { user } = ChatState();
    const toast = useToast();
    const [hoveredMessageId, setHoveredMessageId] = useState("");
    const [editingMessageId, setEditingMessageId] = useState("");
    const [editContent, setEditContent] = useState("");

    const handleStartEdit = (message) => {
        setEditingMessageId(message._id);
        setEditContent(message.content);
    };

    const handleCancelEdit = () => {
        setEditingMessageId("");
        setEditContent("");
    };

    const handleSaveEdit = async (messageId) => {
        if (!editContent.trim()) return;

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                `/api/message/${messageId}`,
                { content: editContent },
                config
            );

            onMessageEdited(data);
            setEditingMessageId("");
            setEditContent("");
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response?.data?.message || "Failed to edit message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    const handleDeleteClick = async (messageId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.delete(`/api/message/${messageId}`, config);

            onMessageDeleted(messageId);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response?.data?.message || "Failed to delete message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    const renderCheckmarks = (m) => {
        const isRead = m.readBy && m.readBy.length > 0;
        const isDelivered = m.deliveredTo && m.deliveredTo.length > 0;

        if (isRead) {
            return <ViewIcon color="blue.500" />;
        } else if (isDelivered) {
            return <span style={{ color: "rgba(0, 0, 0, 0.55)", fontWeight: "bold" }}>✓✓</span>;
        } else {
            return <span style={{ color: "rgba(0, 0, 0, 0.55)" }}>✓</span>;
        }
    };

    return (
        <ScrollableFeed>
            {messages &&
                messages.map((m, i) => {
                    const isCurrentUser = m.sender._id === user._id;
                    const isUnseen = !m.readBy || m.readBy.length === 0;
                    const showDateHeader = isNewDay(messages, i);

                    return (
                        <div key={m._id} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            {showDateHeader && (
                                <Box display="flex" justifyContent="center" my={4} w="100%">
                                    <Box 
                                        bg="rgba(15, 32, 60, 0.8)" 
                                        color="cyan.300" 
                                        px={3} 
                                        py={1} 
                                        borderRadius="lg" 
                                        fontSize="xs" 
                                        fontWeight="bold"
                                        boxShadow="0 2px 5px rgba(0,0,0,0.2)"
                                        border="1px solid rgba(0, 229, 255, 0.2)"
                                    >
                                        {getChatDate(m.createdAt)}
                                    </Box>
                                </Box>
                            )}
                            <div style={{ display: "flex", width: "100%" }}>
                                {(isSameSender(messages, m, i, user._id) ||
                                    isLastMessage(messages, i, user._id)) && (
                                        <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                                            <Avatar
                                                mt="7px"
                                                mr={1}
                                                size="sm"
                                                cursor="pointer"
                                                name={m.sender.name}
                                                src={m.sender.pic}
                                            />
                                        </Tooltip>
                                    )}
                                
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    position="relative"
                                    maxW="75%"
                                    ml={isCurrentUser ? "auto" : isSameSenderMargin(messages, m, i, user._id)}
                                    mt={isSameUser(messages, m, i, user._id) ? 1 : 2}
                                    onMouseEnter={() => setHoveredMessageId(m._id)}
                                    onMouseLeave={() => setHoveredMessageId("")}
                                >
                                    {isCurrentUser && isUnseen && hoveredMessageId === m._id && editingMessageId !== m._id && (
                                        <Box display="flex" gap={1} mr={2}>
                                            <IconButton
                                                size="xs"
                                                icon={<EditIcon />}
                                                aria-label="Edit message"
                                                onClick={() => handleStartEdit(m)}
                                                bg="transparent"
                                                color="cyan.300"
                                                _hover={{ bg: "whiteAlpha.200", color: "cyan.100" }}
                                            />
                                            <IconButton
                                                size="xs"
                                                icon={<DeleteIcon />}
                                                aria-label="Delete message"
                                                onClick={() => handleDeleteClick(m._id)}
                                                bg="transparent"
                                                color="red.400"
                                                _hover={{ bg: "whiteAlpha.200", color: "red.200" }}
                                            />
                                        </Box>
                                    )}

                                    {editingMessageId === m._id ? (
                                        <Box display="flex" alignItems="center" bg="rgba(0,0,0,0.4)" borderRadius="10px" p={1}>
                                            <Input
                                                size="sm"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                bg="rgba(255,255,255,0.08)"
                                                color="white"
                                                border="1px solid"
                                                borderColor="cyan.600"
                                                borderRadius="10px"
                                                w="150px"
                                                _focus={{ borderColor: "cyan.400" }}
                                            />
                                            <IconButton
                                                size="xs"
                                                ml={1}
                                                icon={<CheckIcon />}
                                                aria-label="Save"
                                                onClick={() => handleSaveEdit(m._id)}
                                                colorScheme="cyan"
                                            />
                                            <IconButton
                                                size="xs"
                                                ml={1}
                                                icon={<CloseIcon />}
                                                aria-label="Cancel"
                                                onClick={handleCancelEdit}
                                                colorScheme="red"
                                            />
                                        </Box>
                                    ) : (
                                        <span
                                            style={{
                                                backgroundColor: `${isCurrentUser ? "#00e5ff" : "rgba(255, 255, 255, 0.08)"}`,
                                                color: `${isCurrentUser ? "black" : "white"}`,
                                                border: `${isCurrentUser ? "none" : "1px solid rgba(255, 255, 255, 0.1)"}`,
                                                borderRadius: "20px",
                                                padding: "6px 16px",
                                                fontSize: "15px",
                                                fontWeight: "500",
                                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "flex-end",
                                                gap: "2px",
                                            }}
                                        >
                                            <div style={{ alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: "6px" }}>
                                                {m.fileUrl && (
                                                    <Box mb={2}>
                                                        {m.fileType && m.fileType.startsWith("image/") ? (
                                                            <Box position="relative" display="inline-block">
                                                                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                    <img 
                                                                        src={m.fileUrl} 
                                                                        alt="attachment" 
                                                                        style={{ 
                                                                            maxWidth: "200px", 
                                                                            maxHeight: "200px", 
                                                                            borderRadius: "10px",
                                                                            cursor: "pointer" 
                                                                        }} 
                                                                    />
                                                                </a>
                                                                <IconButton
                                                                    as="a"
                                                                    href={m.fileUrl}
                                                                    download
                                                                    target="_blank"
                                                                    icon={<DownloadIcon />}
                                                                    size="xs"
                                                                    position="absolute"
                                                                    bottom="5px"
                                                                    right="5px"
                                                                    colorScheme="blackAlpha"
                                                                    borderRadius="full"
                                                                    aria-label="Download Image"
                                                                />
                                                            </Box>
                                                        ) : (
                                                            <Box 
                                                                display="flex" 
                                                                alignItems="center" 
                                                                p={2} 
                                                                bg="rgba(255, 255, 255, 0.1)" 
                                                                borderRadius="10px"
                                                                gap={3}
                                                            >
                                                                <ExternalLinkIcon color="cyan.300" />
                                                                <a 
                                                                    href={m.fileUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    style={{ textDecoration: "none", fontSize: "13px", color: "white" }}
                                                                >
                                                                    View Document
                                                                </a>
                                                                <IconButton
                                                                    as="a"
                                                                    href={m.fileUrl}
                                                                    download
                                                                    target="_blank"
                                                                    icon={<DownloadIcon />}
                                                                    size="xs"
                                                                    colorScheme="cyan"
                                                                    variant="ghost"
                                                                    aria-label="Download"
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                                {m.content && <div>{m.content}</div>}
                                            </div>
                                            <div style={{ 
                                                fontSize: "10px", 
                                                opacity: 0.7, 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "4px" 
                                            }}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isCurrentUser && renderCheckmarks(m)}
                                            </div>
                                        </span>
                                    )}
                                </Box>
                            </div>
                        </div>
                    );
                })}
        </ScrollableFeed>
    );
};

export default ScrollableChat;
