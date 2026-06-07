import { Box, Container, Stack, Text, Link, Flex, Icon, Divider } from "@chakra-ui/react";
import { FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = () => {
    return (
        <Box
            bg="rgba(15, 32, 60, 0.95)"
            color="gray.200"
            py={10}
            borderTop="1px solid rgba(0, 255, 255, 0.2)"
        >
            <Container maxW="1200px">
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems="center"
                    gap={8}
                >
                    <Stack spacing={2} textAlign={{ base: "center", md: "left" }}>
                        <Text fontSize="xl" fontWeight="bold" color="cyan.400">
                            FriendLink
                        </Text>
                        <Text fontSize="sm">Connect with friends instantly and securely.</Text>
                    </Stack>

                    <Stack spacing={4} textAlign={{ base: "center", md: "left" }}>
                        <Text fontWeight="bold">Contact Us</Text>
                        <Flex alignItems="center" justifyContent={{ base: "center", md: "flex-start" }} gap={3}>
                            <Icon as={FaPhone} color="cyan.400" />
                            <Text fontSize="sm">8805608725</Text>
                        </Flex>
                        <Flex alignItems="center" justifyContent={{ base: "center", md: "flex-start" }} gap={3}>
                            <Icon as={FaEnvelope} color="cyan.400" />
                            <Link href="mailto:pgbhadagave@gmail.com" fontSize="sm" _hover={{ color: "cyan.300" }}>
                                pgbhadagave@gmail.com
                            </Link>
                        </Flex>
                    </Stack>
                </Flex>

                <Divider my={8} borderColor="whiteAlpha.300" />

                <Text textAlign="center" fontSize="xs" color="gray.500">
                    © {new Date().getFullYear()} FriendLink. All rights reserved. Designed by Premkumar Bhadagave.
                </Text>
            </Container>
        </Box>
    );
};

export default Footer;