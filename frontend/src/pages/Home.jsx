import React, { useEffect } from 'react'
import {Tabs, Box, Container, Text, TabList,Tab,TabPanels,TabPanel,} from '@chakra-ui/react'
import { LuLogIn, LuUserPlus } from "react-icons/lu"
import Login from '../components/Authontication/Login'
import SignUp from '../components/Authontication/SignUp'
import { useNavigate } from 'react-router-dom'
function Home() {
  const navigate=useNavigate()
  useEffect(() => {
    const user=JSON.parse(localStorage.getItem("user"))
    if(user){
      navigate("/chats")
    }
  }, [navigate])
  
  return (

    <Container maxW='xl' centerContent>
      <Box
        display='flex'
        justifyContent='center'
        textAlign='center'
        p={3}
        bg="rgba(255, 255, 255, 0.08)"
        w="100%"
        m='70px 10px 5px 0px'
        borderRadius='lg'
        borderWidth='1px'
        borderColor="blue.400"
        color="#00ffff"
        backdropFilter="blur(10px)"
      >
        <Text fontSize='larger' fontWeight='bold'>FriendLink</Text>
      </Box>
      <Box
      
        p={3}
        bg="rgba(255, 255, 255, 0.08)"
        w="100%"
        m=' 10px 10px 5px 0px'
        borderRadius='lg'
        borderWidth='1px'
        borderColor="blue.400"
        color="#00ffff"
        backdropFilter="blur(10px)"
      >
        <Tabs variant="soft-rounded">
          <TabList
            bg="whiteAlpha.200"
            p="1.5"
            borderRadius="xl"
            display="flex"
            justifyContent="space-around"
            width="100%"
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor="whiteAlpha.300"
            boxShadow="0 8px 24px rgba(0, 80, 160, 0.25)"
          >
            <Tab
              display="flex"
              alignItems="center"
              gap="2"
              width='50%'
              color="whiteAlpha.800"
              _selected={{
                bg: "black",
                color: "cyan.400",
                boxShadow: "0 4px 12px rgba(0, 255, 255, 0.4)",
              }}
            >
              <LuLogIn size={16} />
              Login
            </Tab>
            <Tab
              display="flex"
              alignItems="center"
              gap="2"
              width='50%'

              color="whiteAlpha.800"
              _selected={{
                bg: "black",
                color: "cyan.400",
                boxShadow: "0 4px 12px rgba(0, 255, 255, 0.4)",
              }}
            >
              <LuUserPlus size={16} />
              Register Here
            </Tab>
          </TabList>
          <TabPanels mt="6">
            <TabPanel color="cyan.300">
              <Login/>
            </TabPanel>
            <TabPanel color="cyan.300">
              <SignUp/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>

  )
}

export default Home
