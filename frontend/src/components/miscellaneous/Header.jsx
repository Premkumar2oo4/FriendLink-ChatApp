import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate("/");
    };

    const handleAuthClick = () => {
        navigate("/auth");
    };

    return (
        <Box
            bg="rgba(15, 32, 60, 0.9)"
            px={4}
            py={3}
            position="sticky"
            top="0"
            zIndex="1000"
            backdropFilter="blur(10px)"
            borderBottom="1px solid rgba(0, 255, 255, 0.2)"
        >
            <Flex h={16} alignItems={"center"} justifyContent={"space-between"} maxW="1200px" mx="auto">
                <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="cyan.400"
                    cursor="pointer"
                    onClick={handleLogoClick}
                    _hover={{ transform: "scale(1.02)" }}
                    transition="all 0.2s"
                >
                    FriendLink
                </Text>

                <Flex alignItems={"center"} gap={4}>
                    <Button
                        variant="link"
                        color="white"
                        _hover={{ color: "cyan.300", textDecoration: "none" }}
                        onClick={handleAuthClick}
                        fontWeight="medium"
                    >
                        Login
                    </Button>
                    <Button
                        bgGradient="linear(to-r, cyan.400, blue.500)"
                        color="white"
                        _hover={{ 
                            bgGradient: "linear(to-r, cyan.300, blue.400)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(0, 255, 255, 0.3)"
                        }}
                        onClick={handleAuthClick}
                        px={6}
                        transition="all 0.2s"
                    >
                        Get Started
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
};

export default Header;