const User = require("../models/userModel");

const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
  const { userName, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 12);
  try {
    const newUser = await User.create({
      userName,
      password: hashPassword,
    });

    req.session.user = newUser;

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
      errors: e,
    });
  }
};

exports.login = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (isCorrect) {
      req.session.user = user;
      res.status(200).json({
        staus: "success",
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Incorrect username or password",
      });
    }
  } catch (e) {
    res.status(400).json({
      status: "fail",
      errors: e,
    });
  }
};
