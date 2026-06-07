import React, { useEffect } from 'react'
import {Tabs, Box, Container, Text, TabList,Tab,TabPanels,TabPanel, Flex,} from '@chakra-ui/react'
import { LuLogIn, LuUserPlus } from "react-icons/lu"
import Login from '../components/Authontication/Login'
import SignUp from '../components/Authontication/SignUp'
import { useNavigate } from 'react-router-dom'
import Header from '../components/miscellaneous/Header'
import Footer from '../components/miscellaneous/Footer'

function Home() {
  const navigate=useNavigate()
  useEffect(() => {
    const user=JSON.parse(localStorage.getItem("userInfo"))
    if(user){
      navigate("/chats")
    }
  }, [navigate])
  
  return (
    <Box minH="100vh" display="flex" flexDir="column">
      <Header />
      
      <Flex flex="1" align="center" justify="center" py={10}>
        <Container maxW='xl' centerContent>
          <Box
            display='flex'
            justifyContent='center'
            textAlign='center'
            p={3}
            bg="rgba(15, 32, 60, 0.8)"
            w="100%"
            m='0 0 15px 0'
            borderRadius='lg'
            borderWidth='1px'
            borderColor="cyan.500"
            color="cyan.300"
            backdropFilter="blur(10px)"
          >
            <Text fontSize='2xl' fontWeight='bold' fontFamily="Work Sans">FriendLink</Text>
          </Box>
          <Box
            p={6}
            bg="rgba(15, 32, 60, 0.8)"
            w="100%"
            borderRadius='lg'
            borderWidth='1px'
            borderColor="cyan.500"
            color="white"
            backdropFilter="blur(10px)"
          >
            <Tabs variant="soft-rounded" colorScheme="cyan">
              <TabList mb="1em">
                <Tab width='50%' color="white" _selected={{ bg: "cyan.500", color: "black" }}>
                  <LuLogIn size={18} style={{ marginRight: '8px' }} />
                  Login
                </Tab>
                <Tab width='50%' color="white" _selected={{ bg: "cyan.500", color: "black" }}>
                  <LuUserPlus size={18} style={{ marginRight: '8px' }} />
                  Signup
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Login/>
                </TabPanel>
                <TabPanel>
                  <SignUp/>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Container>
      </Flex>

      <Footer />
    </Box>
  )
}

export default Home
