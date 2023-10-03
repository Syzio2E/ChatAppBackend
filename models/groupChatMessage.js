const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const GroupMessage = sequelize.define('groupmessage',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        required:true
    },
    message:{
        type:Sequelize.STRING,
        required:true
    },
    sender:{
        type:Sequelize.INTEGER,
        required:true
    }
})

module.exports = GroupMessage