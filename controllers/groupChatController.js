const GroupChat = require('../models/groupChat');
const { Op } = require("sequelize")
const sequelize = require('sequelize');
const User = require('../models/User')
const GroupMessage = require('../models/groupChatMessage')

const createGroupChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const groupname = req.body.groupname;
        const selectedUsers = req.body.users;
        console.log(selectedUsers)
        if (!groupname || !selectedUsers || selectedUsers.length < 1) {
            return res.status(400).json({ message: 'Fill all fields' });
        }

        const chat = await GroupChat.create({
            userId: userId,
            groupname: groupname,
            members: selectedUsers,
        });

        console.log(chat);
        res.status(201).json({ message: 'Group chat created successfully', chat});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const userGroups = async (req, res) => {
    const userId = req.user.id;
    try {
      const groups = await GroupChat.findAll({
        where: {
          [Op.or]: [
            { userId: userId },
            sequelize.literal(`JSON_CONTAINS(members, '${userId}')`), 
          ],
        },
        attributes: ['id', 'groupname','admin','userId']
      });
      res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching user groups");
    }
  };

  const createGroupMessage = async (req, res) => {
    const {  message } = req.body;
    const groupId = req.params.groupId
    const userId = req.user.id;
    try {
      const chat = await GroupMessage.create({
        groupchatId: groupId,
        message: message,
        sender:userId
      });

      res.status(201).json({ message: 'Message sent successfully', chat });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const getGroupParticipants = async (req, res) => {
    const groupId = req.params.groupId;
    try {
      const group = await GroupChat.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      const users = await GroupChat.findAll({
        where: {
          id: groupId,
        },
        attributes: ["members"], 
      });
      const memberIds = JSON.parse(users[0].members || "[]");
      const membersWithNames = [];
      for (const memberId of memberIds) {
        const user = await User.findByPk(memberId);
        if (user) {
          membersWithNames.push({ id: user.id, name: user.name });
        }
      }
      res.status(200).json({  participants: membersWithNames });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const getUserGroupMessage = async (req, res) => {
    const groupId = req.params.groupid;
    try {
      const chats = await GroupMessage.findAll({
        where: {
          groupchatId: groupId,
        },
      });
        res.status(200).json({ message: 'Success', chats });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  
  const updateGroupName = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    const groupId = req.params.groupId;
  
    try {
      const group = await GroupChat.findByPk(groupId);  
      if (group.userId === userId) {
        group.groupname = name;
        await group.save();
        return res.status(200).json({ message: 'Group name updated successfully', group });
      }
  
      return res.status(403).json({ error: 'You are not authorized' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  };

  const removeUserFromGroup = async (req, res) => {
    const groupId = req.params.groupId;
    const selectedUserId = req.params.id; // Assuming selectedUserId is the user ID to be removed
    const userId = req.user.id;
  
    try {
      const group = await GroupChat.findByPk(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      if (group.userId !== userId) {
        return res.status(400).json({ message: 'You are not authorized' });
      }
  
      // Parse the members JSON string into an array
      const membersArray = JSON.parse(group.members);
  
      // Use the filter method to create a new array of member IDs excluding the selectedUserId
      const updatedMembersArray = membersArray.filter((memberId) => memberId !== selectedUserId);
  
      // Convert the updatedMembersArray back to a JSON string
      group.members = JSON.stringify(updatedMembersArray);
  
      // Save the updated group with the user removed
      await group.save();
  
      return res.status(200).json({ message: 'User removed from the group', group });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


module.exports = {
    createGroupChat,
    userGroups,
    createGroupMessage,
    getGroupParticipants,
    getUserGroupMessage,
    updateGroupName,
    removeUserFromGroup
};