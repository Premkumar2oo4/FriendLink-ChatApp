import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../config/ChatLogics'
import ProfileModal from './miscellaneous/ProfileModal'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal'
import axios from 'axios'
import './style.css'
import ScrollableChat from './ScrollableChat'
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    // const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const toast = useToast();
    const { user, selectedChat, setSelectedChat } = ChatState()
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
            console.log(messages);
            
            setMessages(data);
            setLoading(false);

            // socket.emit("join chat", selectedChat._id);
        } catch (error) {
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
    useEffect(()=>{
        fetchMessages()
    },[selectedChat])
    const sendMessage = async (event) => {
        if (event.key === 'Enter' && newMessage) {
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.post('/api/message', {
                    content: newMessage,
                    chatId: selectedChat._id,
                },
                    config
                );
                console.log(data);

                setNewMessage("");
                setMessages([...messages, data])
            } catch (error) {
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
    const typingHandler = (e) => {
        setNewMessage(e.target.value)
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
                        justifyContent="space-between"
                        alignItems="center"
                        color="cyan"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                            </>
                        ) : (
                            <>{selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                    fetchMessages={fetchMessages}
                                />
                            </>
                        )}
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="transparent"

                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >

                        {loading ? (
                            <Box display="flex"
                                flexDir="column"
                                justifyContent="flex-end"
                                p={3}
                                bg="black"
                                opacity={0.9}
                                w="100%"
                                h="100%"
                                borderRadius="lg"
                                overflowY="hidden">
                                <Spinner
                                    size="xl"
                                    w={20}
                                    h={20}
                                    color='cyan'

                                    alignSelf="center"
                                    margin="auto"
                                />
                            </Box>
                        ) : (
                            <div className="message ">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <FormControl
                            onKeyDown={sendMessage}
                            //   id="first-name"
                            isRequired
                            mt={3}
                        >
                            {/* {istyping ? (
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
                          )} */}
                            <Input
                                variant="filled"
                                bg="transparent"
                                color="white"
                                _hover={{ bg: "transparent" }}
                                border="1px solid cyan"
                                p={7}
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (<Box display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text
                    fontSize="3xl"
                    fontFamily="Work Sans"
                    bg="#00183e"
                    p="20px"
                    rounded="3xl"
                    color="cyan"
                >
                    Click on a user to start chatting
                </Text>
            </Box>)}
        </>
    )
}

export default SingleChat
