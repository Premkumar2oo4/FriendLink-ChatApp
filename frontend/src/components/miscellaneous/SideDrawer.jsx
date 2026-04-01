import React, {useState} from "react";
import { ChatState } from '../../Context/ChatProvider'
import {  Drawer,  DrawerBody,  DrawerContent,  DrawerHeader,  DrawerOverlay,useToast} from "@chakra-ui/react";
import { Box, Tooltip, Button, Text, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Badge, Avatar } from "@chakra-ui/react"; 
import { useNavigate } from "react-router-dom";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { LuSearch } from "react-icons/lu";
import ProfileModal from "./ProfileModal";
import { useDisclosure } from "@chakra-ui/react"; 
import { Input } from "@chakra-ui/react";
import ChatLoading from '../ChatLoading'
import axios from "axios";
import { Spinner } from "@chakra-ui/react";
import UserListItem from "../userAvatar/UserListItem";
function SideDrawer() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { setSelectedChat,user,notification,setNotification,chats,setChats} = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast=useToast()

  const logouthandler=()=>{
    localStorage.removeItem("userInfo")
    navigate('/')
  }
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
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
  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };


  return (
    <>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      
      w="100%"
      p="5px 10px"
      color="#00fcff"
    >
      {/* Search */}
      <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button backgroundColor='transparent' onClick={onOpen} _hover={{
          bg: "cyan.500",
          color: "white",
        }}
          color="cyan" leftIcon={<LuSearch />}>
          <Text display={{ base: "none", md: "flex" }}>Search User</Text>
        </Button>
      </Tooltip>

      {/* Title */}
      <Text fontSize="2xl" fontFamily="Work sans" fontWeight="bold">
        FriendLink
      </Text>

      <div>
        {/* Notifications */}
        <Menu>
          <MenuButton p={1}>
            <Badge />
            <BellIcon fontSize="2xl" m={1} />
          </MenuButton>

          <MenuList>
            <MenuItem>No New Messages</MenuItem>
          </MenuList>
        </Menu>

        {/* Profile */}
        <Menu>
          <MenuButton
            as={Button}
            bg="transparent"
            color="white"
            _hover={{
              bg: "cyan.500",
              color: "black",
            }}
            rightIcon={<ChevronDownIcon />}
          >
            <Avatar size="sm" cursor="pointer" name={user.name}  src={user.pic} />
          </MenuButton>

          <MenuList backgroundColor='cyan.900'>
            <ProfileModal user={user}>
            <MenuItem backgroundColor='transparent'>My Profile</MenuItem>
            </ProfileModal>
            <MenuDivider/>
            <MenuItem backgroundColor='transparent' onClick={logouthandler}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />

        <DrawerContent bg="#071A3A" color="white">

          <DrawerHeader
            borderBottomWidth="1px"
            borderColor="cyan.500"
            color="cyan.300"
            fontSize="22px"
            fontWeight="bold"
          >
            Search Users
          </DrawerHeader>

          <DrawerBody>

            <Box display="flex" alignItems="center" gap={2} pb={4}>
              <Input
                flex="1"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="#0B2A5B"
                border="1px solid"
                borderColor="cyan.600"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px cyan" }}
              />

              <Button
                bg="cyan.500"
                color="black"
                _hover={{ bg: "cyan.400" }}
                onClick={handleSearch}
              >
                Go
              </Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex" color="cyan.400" />}

          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
