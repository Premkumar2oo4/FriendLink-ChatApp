import {
    Box,
    Container,
    Heading,
    Text,
    Stack,
    Button,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    useColorModeValue,
    Flex,
    Icon,
    Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/miscellaneous/Header";
import Footer from "../components/miscellaneous/Footer";
import { FaUsers, FaUserCheck, FaRocket, FaShieldAlt, FaBolt, FaComments } from "react-icons/fa";

const LandingPage = () => {
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            navigate("/chats");
        }

        const fetchStats = async () => {
            try {
                const { data } = await axios.get("/api/user/stats");
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <Box minH="100vh" display="flex" flexDir="column" bg="#071A3A">
            <Header />

            <Box flex="1">
                {/* Hero Section */}
                <Container maxW={"3xl"} py={24}>
                    <Stack
                        as={Box}
                        textAlign={"center"}
                        spacing={{ base: 8, md: 14 }}
                    >
                        <Heading
                            fontWeight={700}
                            fontSize={{ base: "4xl", md: "6xl" }}
                            lineHeight={"110%"}
                            color="white"
                        >
                            Connect with Anyone, <br />
                            <Text as={"span"} color={"cyan.400"}>
                                Anywhere.
                            </Text>
                        </Heading>
                        <Text color={"gray.300"} fontSize="xl" fontWeight="medium">
                            FriendLink is a secure, fast, and modern chat application.
                            Experience seamless communication with your friends and colleagues in real-time.
                        </Text>
                        <Stack
                            direction={"column"}
                            spacing={3}
                            align={"center"}
                            alignSelf={"center"}
                            position={"relative"}
                        >
                            <Button
                                colorScheme={"cyan"}
                                bgGradient="linear(to-r, cyan.400, blue.500)"
                                rounded={"full"}
                                px={12}
                                py={8}
                                fontSize="xl"
                                fontWeight="bold"
                                _hover={{
                                    bgGradient: "linear(to-r, cyan.300, blue.400)",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
                                }}
                                onClick={() => navigate("/auth")}
                                leftIcon={<Icon as={FaRocket} />}
                                transition="all 0.3s"
                            >
                                Get Started Now
                            </Button>
                        </Stack>
                    </Stack>
                </Container>

                {/* Stats Section */}
                <Box bg="rgba(0, 255, 255, 0.03)" py={20} borderY="1px solid rgba(0, 255, 255, 0.1)">
                    <Container maxW="1000px">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, lg: 16 }}>
                            <StatCard
                                title={"Total Users Joined"}
                                stat={stats.totalUsers}
                                icon={<FaUsers size={"3.5em"} />}
                                color="cyan.400"
                            />
                            <StatCard
                                title={"Active Users (24h)"}
                                stat={stats.activeUsers}
                                icon={<FaUserCheck size={"3.5em"} />}
                                color="green.400"
                            />
                        </SimpleGrid>
                    </Container>
                </Box>

                {/* Features Section */}
                <Container maxW="1200px" py={24}>
                    <Heading textAlign="center" color="white" mb={16} fontSize="3xl">
                        Why Choose <Text as="span" color="cyan.400">FriendLink</Text>?
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12}>
                        <FeatureItem
                            icon={FaComments}
                            title="Real-time Chat"
                            description="Instant message delivery using advanced socket technology."
                        />
                        <FeatureItem
                            icon={FaShieldAlt}
                            title="Secure & Private"
                            description="Your data and conversations are kept safe and protected."
                        />
                        <FeatureItem
                            icon={FaBolt}
                            title="Lightning Fast"
                            description="Optimized performance for a smooth and lag-free experience."
                        />
                    </SimpleGrid>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

const StatCard = ({ title, stat, icon, color }) => {
    return (
        <Stat
            px={{ base: 6, md: 10 }}
            py={"8"}
            shadow={"2xl"}
            border={"1px solid"}
            borderColor="rgba(0, 255, 255, 0.2)"
            rounded={"2xl"}
            bg="rgba(15, 32, 60, 0.9)"
            backdropFilter="blur(15px)"
        >
            <Flex justifyContent={"space-between"}>
                <Box pl={{ base: 2, md: 4 }}>
                    <StatLabel fontWeight={"bold"} isTruncated color="gray.400" fontSize="lg" mb={2}>
                        {title}
                    </StatLabel>
                    <StatNumber fontSize={"5xl"} fontWeight={"extrabold"} color={color}>
                        {stat}
                    </StatNumber>
                </Box>
                <Box
                    my={"auto"}
                    color={color}
                    alignContent={"center"}
                >
                    {icon}
                </Box>
            </Flex>
        </Stat>
    );
};

const FeatureItem = ({ icon, title, description }) => (
    <Box 
        textAlign="center" 
        p={8} 
        borderRadius="2xl" 
        bg="rgba(255,255,255,0.02)" 
        border="1px solid rgba(255,255,255,0.05)"
        _hover={{ bg: "rgba(255,255,255,0.05)", transform: "translateY(-5px)", borderColor: "cyan.500" }}
        transition="all 0.3s"
    >
        <Icon as={icon} w={12} h={12} color="cyan.400" mb={6} />
        <Heading size="md" color="white" mb={4}>{title}</Heading>
        <Text color="gray.400" lineHeight="tall">{description}</Text>
    </Box>
);

export default LandingPage;