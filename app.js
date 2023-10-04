const express = require('express')
require('dotenv').config()
const cors = require('cors')
const http = require('http');
const sequelize = require('./utils/database')
const userRoutes = require('./routes/user')
const chatRoutes = require('./routes/chat')
const groupChatRoutes = require('./routes/groupChat')
const GroupChat =require('./models/groupChat')
const GroupMessage = require('./models/groupChatMessage')
const Chat = require('./models/chat')
const User = require('./models/User')
const socketio = require('socket.io')

app.use(cors())

const app = express()
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST','DELETE','PUT','PATCH',], 
    credentials: true, 
  },
  pingTimeout: 60000, 
});
app.use(express.json())
app.use(cors())
app.use(userRoutes)
app.use(groupChatRoutes)
app.use(chatRoutes)


User.hasMany(Chat)
Chat.belongsTo(User)
GroupChat.belongsTo(User)
User.hasMany(GroupChat)
GroupMessage.belongsTo(GroupChat)
GroupChat.hasMany(GroupMessage)




sequelize
  .sync()
  .then(() => {
     server.listen(8000, () => {
      console.log('Server is running on port 8000');
    });

    io.on('connection', (socket) => {
      console.log('User connected >>>');


      // socket.emit('broadcast',{message: users+ 'users connected'})
      socket.on('setup',(userData)=>{
      socket.join(userData)
      console.log('connected user-', userData)
      socket.emit('connected')
      })

      socket.on('join chat',(room)=>{
        socket.join(room)
        console.log('user joined room',room)
      })

      socket.on('new message',(payload)=>{
        console.log('payload---',payload)
        socket.broadcast.emit('message received',payload)
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
  
      });
    
  })
  })
  .catch((err) => {
    console.log(err);
  });


  