import { ViewIcon } from "@chakra-ui/icons";
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
    IconButton,
    Text,
    Image,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    if (!user) return null;

    return (
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton
                    display={{ base: "flex" }}
                    icon={<ViewIcon />}
                    onClick={onOpen}
                    bg="transparent"
                    color="cyan.300"
                    border="1px solid"
                    borderColor="cyan.500"
                    _hover={{ bg: "cyan.500", color: "black" }}
                />
            )}
            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
                <ModalContent
                    h="410px"
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
                        borderTopRadius="20px"
                    >
                        {user.name}
                    </ModalHeader>

                    <ModalCloseButton color="white" />

                    <ModalBody
                        display="flex"
                        flexDir="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={4}
                        py={6}
                    >
                        <Image
                            borderRadius="full"
                            boxSize="150px"
                            src={user.pic}
                            alt={user.name}
                            border="8px solid"
                            borderColor="cyan.400"
                        />

                        <Text
                            fontSize={{ base: "20px", md: "22px" }}
                            fontFamily="Work Sans"
                            color="gray.200"
                        >
                            Email: {user.email}
                        </Text>
                    </ModalBody>

                    <ModalFooter justifyContent="center" borderTop="1px solid rgba(255,255,255,0.1)">
                        <Button bg="#00e5ff" color="black" _hover={{ bg: "#00c8e0" }} onClick={onClose} w="120px">
                            Close
                        </Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfileModal;