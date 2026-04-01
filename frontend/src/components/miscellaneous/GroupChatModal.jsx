import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton,Button,useDisclosure,FormControl,Input,useToast,Box,} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const { user, chats, setChats } = ChatState();

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
          
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(
                `/api/chat/group`,
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } catch (error) {
            toast({
                title: "Failed to Create the Chat!",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal onClose={onClose} isOpen={isOpen} isCentered size="lg">
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />

                <ModalContent
                    bg="rgba(15, 32, 60, 0.95)"
                    color="white"
                    borderRadius="20px"
                    border="1px solid rgba(255,255,255,0.15)"
                    boxShadow="0 10px 40px rgba(0,0,0,0.6)"
                >
                    <ModalHeader
                        fontSize="28px"
                        fontWeight="600"
                        textAlign="center"
                        borderBottom="1px solid rgba(255,255,255,0.1)"
                    >
                        Create Group Chat
                    </ModalHeader>

                    <ModalCloseButton />

                    <ModalBody pt={6} pb={4}>
                        {/* Group Name */}
                        <FormControl mb={4}>
                            <Input
                                placeholder="Enter Group Name"
                                bg="rgba(255,255,255,0.08)"
                                border="1px solid rgba(255,255,255,0.2)"
                                _hover={{ borderColor: "#00e5ff" }}
                                _focus={{ borderColor: "#00e5ff", boxShadow: "0 0 5px #00e5ff" }}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>

                        {/* Search Users */}
                        <FormControl mb={3}>
                            <Input
                                placeholder="Search Users..."
                                bg="rgba(255,255,255,0.08)"
                                border="1px solid rgba(255,255,255,0.2)"
                                _hover={{ borderColor: "#00e5ff" }}
                                _focus={{ borderColor: "#00e5ff", boxShadow: "0 0 5px #00e5ff" }}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>

                        {/* Selected Users */}
                        <Box w="100%" display="flex" flexWrap="wrap" gap={2} mb={3}>
                            {selectedUsers.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleDelete(u)}
                                />
                            ))}
                        </Box>

                        {/* Search Results */}
                        <Box maxH="200px" overflowY="auto">
                            {loading ? (
                                <Box textAlign="center" py={4}>
                                    Loading...
                                </Box>
                            ) : (
                                searchResult
                                    ?.slice(0, 4)
                                    .map((user) => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => handleGroup(user)}
                                        />
                                    ))
                            )}
                        </Box>
                    </ModalBody>

                    <ModalFooter borderTop="1px solid rgba(255,255,255,0.1)">
                        <Button
                            w="100%"
                            bg="#00e5ff"
                            color="black"
                            _hover={{ bg: "#00c8e0" }}
                            onClick={handleSubmit}
                        >
                            Create Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GroupChatModal;