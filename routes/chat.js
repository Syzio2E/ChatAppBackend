const express = require('express')
const {authenticate} = require('../middleware/auth')
const { send, fetchchats, loggedInUserChats } = require('../controllers/chatController')

const router = express.Router()
router.get('/userchat',authenticate,loggedInUserChats)
router.post('/home/:id',authenticate,send)
router.get('/home/:id',authenticate,fetchchats)

// router.post('/group',creatGroupCat)
// router.put('/rename',renameGroup)
// router.put('/groupremove',removeFromGroup)
// router.put('/groupadd',addToGroup)

module.exports = router