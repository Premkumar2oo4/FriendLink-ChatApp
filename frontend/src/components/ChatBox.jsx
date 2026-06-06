import { Box } from "@chakra-ui/react";
// import "./style.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  
  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={4}
      bg="rgba(255, 255, 255, 0.08)"
      backdropFilter="blur(10px)"
      w={{ base: "100%", md: "68%" }}
      borderRadius="15px"
      border="1px solid rgba(255, 255, 255, 0.15)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      color="white"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;