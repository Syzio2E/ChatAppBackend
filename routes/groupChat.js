const express =require('express')
const { authenticate } = require('../middleware/auth')
const { createGroupChat, userGroups, createGroupMessage, getGroupParticipants, getUserGroupMessage, updateGroupName, removeUserFromGroup } = require('../controllers/groupChatController')
const router = express.Router()

router.post('/home/creategroup',authenticate,createGroupChat)
router.get('/home/getgroup',authenticate,userGroups)
router.post('/home/groupmessage/:groupId',authenticate,createGroupMessage)
router.get('/home/groupusers/:groupId',authenticate,getGroupParticipants)
router.get('/home/groupchatmessages/:groupid',authenticate,getUserGroupMessage)
router.put('/home/groupname/:groupId',authenticate,updateGroupName)
router.delete('/home/groupchat/:groupId/:id',authenticate,removeUserFromGroup)



module.exports = router