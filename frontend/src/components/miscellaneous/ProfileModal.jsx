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

    return (
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
            )}
            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent h="410px" bg="gray.800" borderRadius="lg" boxShadow="2xl">

                    <ModalHeader
                        fontSize="36px"
                        fontFamily="Work Sans"
                        display="flex"
                        justifyContent="center"
                        bg="gray.900"
                        color="cyan.300"
                        borderTopRadius="lg"
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
                            border="8px "
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

                    <ModalFooter justifyContent="center">
                        <Button colorScheme="cyan" onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfileModal;