import React from 'react'
import { VStack, Input, Button, FormControl, FormLabel ,InputGroup,InputRightElement} from '@chakra-ui/react';
import { useState } from 'react';
import { useToast } from "@chakra-ui/react";
import  axios from 'axios'
import {useNavigate} from 'react-router-dom';

function SignUp() {
    const [show, setShow] = useState(false);

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const handleClick = () => setShow(!show);
    const [loading, setLoading] = useState(false)
    const toast = useToast();
    const navigate =useNavigate()
    const postDetails = (pics) => {
        setLoading(true);

        if (!pics) {
            toast({
                title: "Image not found",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }
        console.log(pics);

        if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
            toast({
                title: "Please select a JPEG or PNG image",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", "FriendLink");
        data.append("cloud_name", "dsg8zyvhe");

        fetch("https://api.cloudinary.com/v1_1/dsg8zyvhe/image/upload", {
            method: "POST",
            body: data,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    console.error("Cloudinary error:", data.error);
                    toast({
                        title: data.error.message,
                        status: "error",
                        duration: 4000,
                        isClosable: true,
                    });
                    setLoading(false);
                    return;
                }

                setPic(data.secure_url);
                console.log("Uploaded image:", data.secure_url);
                console.log(data.url.toString());

                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast({
                    title: "Image upload failed",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                setLoading(false);
               
                
            });
    };
    async function submitHandler(){
        setLoading(true);
        if (!name || !password || !confirmpassword ||!email){
            toast({
                title: "Please fill all feild",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
            return
        }
        if(password!=confirmpassword){
            toast({
                title: "confirmPassword not match with Password",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
            return
        }
        try {
            const config={
                headers:{
                    'Content-type':'application/json'
                },
            };
            
            const {data}=await  axios.post('/api/user/register',{name,email,password,pic},config);
            toast({
                title: "Registration is SuccessFull",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            localStorage.setItem("userInfo",JSON.stringify(data));
            setLoading(false);
            navigate('/chats')
            
        } catch (error) {
            toast({
                title: `${error}`,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false)
        }
    }
  return (
    
      <VStack spacing="5px">
          
          <FormControl isRequired>
              <FormLabel color="cyan.300">Name</FormLabel>
              <Input
                  placeholder="Enter Your Name"
                  bg="blackAlpha.400"
                  color="white"
                  borderColor="cyan.400"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ borderColor: "cyan.300" }}
                  onChange={(e) => setName(e.target.value)}
              />
          </FormControl>

          <FormControl isRequired>
              <FormLabel color="cyan.300">Email Address</FormLabel>
              <Input
                  type="email"
                  placeholder="Enter Your Email Address"
                  bg="blackAlpha.400"
                  color="white"
                  borderColor="cyan.400"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ borderColor: "cyan.300" }}
                  onChange={(e) => setEmail(e.target.value)}
              />
          </FormControl>

          <FormControl isRequired>
              <FormLabel color="cyan.300">Password</FormLabel>
              <InputGroup>
                  <Input
                      type={show ? "text" : "password"}
                      placeholder="Enter Password"
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="cyan.400"
                      _placeholder={{ color: "gray.400" }}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                      <Button
                          h="1.75rem"
                          size="sm"
                          bg="black"
                          color="white"
                          _hover={{ bg: "gray.800" }}
                          onClick={handleClick}
                      >
                          {show ? "Hide" : "Show"}
                      </Button>
                  </InputRightElement>
              </InputGroup>
          </FormControl>

          <FormControl isRequired>
              <FormLabel color="cyan.300">Confirm Password</FormLabel>
              <InputGroup>
                  <Input
                      type={show ? "text" : "password"}
                      placeholder="Confirm password"
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="cyan.400"
                      _placeholder={{ color: "gray.400" }}
                      onChange={(e) => setConfirmpassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                      <Button
                          h="1.75rem"
                          size="sm"
                          bg="black"
                          color="white"
                          _hover={{ bg: "gray.800" }}
                          onClick={handleClick} 
                      >
                          {show ? "Hide" : "Show"}
                      </Button>
                  </InputRightElement>
              </InputGroup>
          </FormControl>

          <FormControl>
              <FormLabel color="cyan.300">Upload your Picture</FormLabel>
              <Input
                  type="file"
                  p={1.5}
                  bg="blackAlpha.400"
                  color="gray.300"
                  borderColor="cyan.400"
                  accept="image/*"
                  onChange={(e) => postDetails(e.target.files[0])}
              />
          </FormControl>

          <Button
              width="100%"
              h="45px"
              bgGradient="linear(to-r, cyan.400, blue.500)"
              color="white"
              fontWeight="bold"
              _hover={{
                  bgGradient: "linear(to-r, cyan.300, blue.400)",
                  boxShadow: "0 0 12px rgba(0, 229, 255, 0.6)",
              }}
              onClick={submitHandler}
              isLoading={loading}
          >
              Sign Up
          </Button>
      </VStack>


  )
}

export default SignUp