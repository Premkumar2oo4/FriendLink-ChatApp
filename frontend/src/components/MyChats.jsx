import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={4}
      bg="rgba(255,255,255,0.08)"
      backdropFilter="blur(10px)"
      w={{ base: "100%", md: "30%" }}
      borderRadius="15px"
      border="1px solid rgba(255,255,255,0.15)"
      boxShadow="0 8px 32px rgba(0,0,0,0.3)"
      color="white"
    >
      {/* Header */}
      <Box
        pb={4}
        px={2}
        fontSize={{ base: "24px", md: "26px" }}
        fontWeight="600"
        display="flex"
        w="100%"
        color='cyan'
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
        <Button
          size="sm"
          bg="#00e5ff"
          color="black"
          _hover={{ bg: "#00c8e0" }}
          rightIcon={<AddIcon />}
        >
          New Group
        </Button>
    </GroupChatModal>
      </Box>

      {/* Chat List */}
      <Box
        display="flex"
        flexDir="column"
        p={2}
        w="100%"
        h="100%"
        borderRadius="10px"
        overflowY="hidden"
      >
        {chats ? (
          <Stack spacing={2} overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={
                  selectedChat === chat
                    ? "rgba(0,229,255)"
                    : "rgba(255,255,255,0.06)"
                }
                color={
                  selectedChat === chat
                    ? "rgba(0,0,0)"
                    : "rgba(255,255,255)"
                }
                _hover={{ bg: "rgba(0,229,255,0.25)" }}
                
                px={4}
                py={3}
                borderRadius="10px"
                transition="0.2s"
                key={chat._id}
              >
                <Text fontWeight="500">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>

                {chat.latestMessage && (
                  <Text fontSize="xs" opacity="0.8">
                    <b>{chat.latestMessage.sender.name} :</b>{" "}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;