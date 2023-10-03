const Chat = require("../models/chat");
const { Op } = require("sequelize")
const User = require('../models/User')


const send = async (req, res) => {
  try { 
    const userId = req.user.id;
    const toBeSendTo = req.params.id;
    const {message} = req.body;
    const newChatMessage = await Chat.create({
        userId:userId,
        receiverId:toBeSendTo,
        message: message,
      });
      res.status(200).json({ message: 'success', chatMessage: newChatMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while sending the message' });
  }
};

const fetchchats = async (req, res) => {
    try { 
      const userId = req.user.id;
      const toBeSendTo = req.params.id;
      const chats = await Chat.findAll({
        where: {
          [Op.or]: [
            { userId: userId, receiverId: toBeSendTo },
            { userId: toBeSendTo, receiverId: userId }
          ]
        },
        order: [['timestamp', 'ASC']] 
      });
      res.status(200).json({ message: 'Chats fetched successfully', chats: chats });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetchin the message' });
    }
  };
 
  const loggedInUserChats = async (req, res) => {
    try {
      const id = req.user.id;
      const chats = await Chat.findAll({
        where: {
          [Op.or]: [
            { userId: id },
            { receiverId: id }
          ]
        }
      });
  
      // Find unique user IDs from the chats
      const uniqueUserIds = new Set();
      chats.forEach(chat => {
        if (chat.userId !== id) {
          uniqueUserIds.add(chat.userId);
        }
        if (chat.receiverId !== id) {
          uniqueUserIds.add(chat.receiverId);
        }
      });
  
      const users = await User.findAll({
        where: {
          id: [...uniqueUserIds]
        },
        attributes: ['id', 'name']
      });
  
      res.status(200).json({ message: "success", users });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
 
module.exports = {
    send,
    fetchchats,
    loggedInUserChats
}