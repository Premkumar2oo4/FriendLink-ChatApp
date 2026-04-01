const express=require('express')
const { addToGroup, removeFromGroup, renameGroup, createGroupChat, fetchChats, accessChat }=require('../controllers/chatController')
const router=express.Router()
const { protect }=require('../middleware/authMiddleware')
router.post('/',protect,accessChat);
router.get('/',protect,fetchChats);
router.post('/group',protect,createGroupChat);
router.put('/rename',protect,renameGroup);
router.put('/groupremove',protect,removeFromGroup);
router.put('/addgroup',protect,addToGroup);

module.exports=router