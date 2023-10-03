const express = require('express')
const { userSignup, userLogin, getOnlineUsers, findUser, findFromUsers, onUserLogout } = require('../controllers/userController')
const {authenticate} = require('../middleware/auth')

const router = express.Router()
router.get('/users',authenticate,getOnlineUsers)
 router.post('/',userSignup)
 router.post('/login',userLogin)
 router.get('/home',authenticate,findUser)
 router.get('/home',authenticate,findFromUsers)
 router.put('/logout',authenticate,onUserLogout)

module.exports = router 