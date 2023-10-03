const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const GroupChat = sequelize.define('groupchat',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    groupname:{
        type:Sequelize.STRING,
        allowNull:false
    },
    members:{
        type:Sequelize.TEXT
    },
    admin:{
        type:Sequelize.TEXT
    },
})

module.exports = GroupChat

