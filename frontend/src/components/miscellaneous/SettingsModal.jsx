import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Image,
    Text,
    Box,
    Divider,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import { useNavigate } from "react-router-dom";

const SettingsModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [pic, setPic] = useState(user.pic);
    const [loading, setLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [forgotMode, setForgotMode] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    // For Delete Account Confirmation
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const toast = useToast();
    const { setUser } = ChatState();
    const navigate = useNavigate();

    const postDetails = (pics) => {
        setLoading(true);
        if (!pics) {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }

        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "FriendLink");
            data.append("cloud_name", "dsg8zyvhe");
            fetch("https://api.cloudinary.com/v1_1/dsg8zyvhe/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.secure_url.toString());
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        } else {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                "/api/user/profile",
                { name, email, pic },
                config
            );
            toast({
                title: "Profile Updated Successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords Do Not Match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(
                "/api/user/change-password",
                { oldPassword, newPassword },
                config
            );
            toast({
                title: "Password Changed Successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        try {
            await axios.post("/api/user/forgot-password", { email: user.email });
            toast({
                title: "OTP Sent to Email",
                description: "Check console for OTP (Demo purposes)",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setOtpSent(true);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords Do Not Match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        setLoading(true);
        try {
            await axios.post("/api/user/reset-password", {
                email: user.email,
                otp,
                newPassword,
            });
            toast({
                title: "Password Reset Successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setForgotMode(false);
            setOtpSent(false);
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.delete("/api/user/delete", config);
            toast({
                title: "Account Deleted",
                description: "Your account has been permanently removed.",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            localStorage.removeItem("userInfo");
            setUser(null);
            setLoading(false);
            onDeleteClose();
            onClose();
            navigate("/");
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
                <ModalContent
                    bg="rgba(15, 32, 60, 0.95)"
                    color="white"
                    borderRadius="20px"
                    border="1px solid rgba(255,255,255,0.15)"
                    boxShadow="0 10px 40px rgba(0,0,0,0.6)"
                >
                    <ModalHeader
                        fontSize="36px"
                        fontFamily="Work Sans"
                        display="flex"
                        justifyContent="center"
                        borderBottom="1px solid rgba(255,255,255,0.1)"
                        color="cyan.300"
                    >
                        Settings
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody py={6}>
                        <Tabs isFitted variant="soft-rounded" colorScheme="cyan">
                            <TabList mb="1em">
                                <Tab color="white" _selected={{ color: "black", bg: "cyan.400" }}>Profile</Tab>
                                <Tab color="white" _selected={{ color: "black", bg: "cyan.400" }}>Security</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <VStack spacing={4}>
                                        <Image
                                            borderRadius="full"
                                            boxSize="150px"
                                            src={pic}
                                            alt={user.name}
                                            border="8px solid"
                                            borderColor="cyan.400"
                                        />
                                        <FormControl>
                                            <FormLabel color="cyan.300">Name</FormLabel>
                                            <Input
                                                placeholder="Update Name"
                                                borderColor="cyan.400"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel color="cyan.300">Email Address</FormLabel>
                                            <Input
                                                placeholder="Update Email"
                                                borderColor="cyan.400"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel color="cyan.300">Update Profile Picture</FormLabel>
                                            <Input
                                                type="file"
                                                p={1.5}
                                                accept="image/*"
                                                borderColor="cyan.400"
                                                onChange={(e) => postDetails(e.target.files[0])}
                                            />
                                        </FormControl>
                                        <Button
                                            colorScheme="cyan"
                                            width="100%"
                                            onClick={handleUpdateProfile}
                                            isLoading={loading}
                                        >
                                            Save Changes
                                        </Button>
                                    </VStack>
                                </TabPanel>
                                <TabPanel>
                                    {!forgotMode ? (
                                        <VStack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel color="cyan.300">Current Password</FormLabel>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter current password"
                                                    borderColor="cyan.400"
                                                    value={oldPassword}
                                                    onChange={(e) => setOldPassword(e.target.value)}
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel color="cyan.300">New Password</FormLabel>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    borderColor="cyan.400"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel color="cyan.300">Confirm New Password</FormLabel>
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    borderColor="cyan.400"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </FormControl>
                                            <Button
                                                colorScheme="cyan"
                                                width="100%"
                                                onClick={handleChangePassword}
                                                isLoading={loading}
                                            >
                                                Change Password
                                            </Button>
                                            <Button
                                                variant="link"
                                                color="cyan.300"
                                                onClick={() => setForgotMode(true)}
                                            >
                                                Forgot Password?
                                            </Button>

                                            <Divider borderColor="rgba(255,255,255,0.1)" my={4} />

                                            <Box w="100%" p={4} borderRadius="lg" border="1px solid red" bg="rgba(255,0,0,0.05)">
                                                <Text color="red.400" fontWeight="bold" mb={2}>Danger Zone</Text>
                                                <Text fontSize="sm" mb={3}>Once you delete your account, there is no going back. Please be certain.</Text>
                                                <Button colorScheme="red" variant="outline" size="sm" onClick={onDeleteOpen}>
                                                    Delete Account
                                                </Button>
                                            </Box>
                                        </VStack>
                                    ) : (
                                        <VStack spacing={4}>
                                            <Text textAlign="center">
                                                We'll send an OTP to your email: {user.email}
                                            </Text>
                                            {!otpSent ? (
                                                <Button
                                                    colorScheme="cyan"
                                                    width="100%"
                                                    onClick={handleForgotPassword}
                                                    isLoading={loading}
                                                >
                                                    Send OTP
                                                </Button>
                                            ) : (
                                                <>
                                                    <FormControl isRequired>
                                                        <FormLabel color="cyan.300">OTP</FormLabel>
                                                        <Input
                                                            placeholder="Enter OTP"
                                                            borderColor="cyan.400"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                        />
                                                    </FormControl>
                                                    <FormControl isRequired>
                                                        <FormLabel color="cyan.300">New Password</FormLabel>
                                                        <Input
                                                            type="password"
                                                            placeholder="Enter new password"
                                                            borderColor="cyan.400"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                        />
                                                    </FormControl>
                                                    <FormControl isRequired>
                                                        <FormLabel color="cyan.300">Confirm New Password</FormLabel>
                                                        <Input
                                                            type="password"
                                                            placeholder="Confirm new password"
                                                            borderColor="cyan.400"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        colorScheme="cyan"
                                                        width="100%"
                                                        onClick={handleResetPassword}
                                                        isLoading={loading}
                                                    >
                                                        Reset Password
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="link"
                                                color="cyan.300"
                                                onClick={() => {
                                                    setForgotMode(false);
                                                    setOtpSent(false);
                                                }}
                                            >
                                                Back to Change Password
                                            </Button>
                                        </VStack>
                                    )}
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                    <ModalFooter justifyContent="center" borderTop="1px solid rgba(255,255,255,0.1)">
                        <Button
                            bg="#00e5ff"
                            color="black"
                            _hover={{ bg: "#00c8e0" }}
                            onClick={onClose}
                            w="120px"
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Alert */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
                isCentered
            >
                <AlertDialogOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
                <AlertDialogContent bg="#0F203C" color="white" borderRadius="15px" border="1px solid red">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.400">
                        Delete Account
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onDeleteClose} bg="gray.600" color="white" _hover={{ bg: "gray.500" }}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDeleteAccount} ml={3} isLoading={loading}>
                            Delete Permanently
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default SettingsModal;