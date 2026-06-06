import { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
    isLastMessage,
    isSameSender,
    isSameSenderMargin,
    isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { Avatar, Tooltip, Box, IconButton, Input, useToast } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
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
            return <span style={{ color: "#007A33", fontWeight: "bold" }}>✓✓</span>;
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

                    return (
                        <div style={{ display: "flex", width: "100%" }} key={m._id}>
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
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        {m.content}
                                        {isCurrentUser && (
                                            <Box as="span" display="inline-flex" fontSize="12px" ml={1}>
                                                {renderCheckmarks(m)}
                                            </Box>
                                        )}
                                    </span>
                                )}
                            </Box>
                        </div>
                    );
                })}
        </ScrollableFeed>
    );
};

export default ScrollableChat;