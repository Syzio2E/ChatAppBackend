const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

const userSignup = async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  if (
    name == undefined ||
    name.length == 0 ||
    email == null ||
    email.length == 0 ||
    password == null
  ) {
    return res.status(400).json({ err: "Bad parameter.something is missing" });
  }
  try {
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    bcrypt.hash(password, 10, async (err, hash) => {
      const newUser = await User.create({
        name: name,
        email: email,
        password: hash,
        isActive:1
      });
      const token = jwt.sign(
        { name: newUser.name, id: newUser.id },
        process.env.JWT_KEY
      );
      return res.status(201).json({
        message: "User created successfully",
        newUser: newUser,
        token: token,
        username: newUser.name,
        id: newUser.id,
        isActive:1
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// login

const userLogin = (req, res) => {
  const { email, password } = req.body;

  if (email == null || email.length == 0 || password == null) {
    return res.status(400).json({ err: "Bad parameter.something is missing" });
  }

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ success: false, message: "Email not Found. Consider Signing Up!" });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          User.update({ isActive: 1 }, { where: { id: user.id } })
            .then(() => {
              const token = jwt.sign(
                { name: user.name, id: user.id },
                process.env.JWT_KEY
              );
              res.status(200).json({
                msg: "Login successful.",
                token: token,
                username: user.name,
                id: user.id,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ err: "Something went wrong." });
            });
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Password is incorrect" });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: "Something went wrong." });
    });
};

// fetch OnlineUser
const getOnlineUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    console.log("king", req.user.id);
    const users = await User.findAll({
      where: {
        id: { [Sequelize.Op.not]: loggedInUserId },
        isActive: 1
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching online users" });
  }
};

const findUser = async (req, res) => {
  try {
    let keyword = (req.query.search || "").trim();
    const loggedInUserId = req.user.id;
    console.log(keyword);
    if (!keyword || /^\s*$/.test(keyword)) {
      return res.status(404).json({ message: "No users found" });
    }
    const users = await User.findAll({
      where: {
        id: {
          [Op.not]: loggedInUserId,
        },
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${keyword}%`,
            },
          },
        ],
      },
    });

    res.status(200).json({ message: "success", users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};


const findFromUsers = async (req, res) => {
  try {
    const keyword = (req.query.search || "").trim();
    const username = req.user.name;
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            name: {
              [Op.not]: username,
            },
          },
          {
            name: {
              [Op.like]: `%${keyword}%`,
            },
          },
        ],
      },
    });

    if (users.length === 0) {
      res.status(404).json({ message: 'No user found' });
    } else {
      res.status(200).json({ message: 'success', users });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


const onUserLogout = async (req, res) => {
  const userId = req.user.id;
  try {
    const logoutuser = await User.update({ isActive: 0 }, { where: { id: userId} })
    res.status(200).json({message:'success'})
  } catch (error) {
    console.log(err)
  }
};

module.exports = {
  userSignup,
  userLogin,
  getOnlineUsers,
  findUser,
  findFromUsers,
  onUserLogout
};
