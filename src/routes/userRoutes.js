const express = require("express");
const mongoose = require("mongoose");
const keys = require("../config/keys");
//const requireAuth = require("../middlewares/requireAuth");

const User = mongoose.model("User");
const Setting = mongoose.model("Setting");

const router = express.Router();

const checkIfDuplicated = async (nickname) => {
  const duplicatedUser = await User.findOne({ nickname });
  return duplicatedUser ? true : false;
};

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get("/user/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  res.send(user);
});

router.get("/user/deviceId/:deviceId", async (req, res) => {
  var user = await User.findOne({ userToken: req.params.deviceId });
  if (!user) {
    // this deviceId has no user associated, create new user
    user = new User({
      userToken: req.params.deviceId,
    });
  }
  if (!user.nickname) {
    // this deviceId has user, but no nickname associated, assign values
    const settings = await Setting.findOne();
    const randomNames = settings.commentsNicknames;
    const randomAvatars = settings.commentsAvatars;
    const randomColors = settings.commentsColors;
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const newNickname =
      randomNames[Math.floor(Math.random() * randomNames.length)] +
      randomDigits;
    const newAvatar =
      randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
    const newColor =
      randomColors[Math.floor(Math.random() * randomColors.length)];
    user.nickname = newNickname;
    user.avatar = newAvatar;
    user.color = newColor;
    await user.save();
  }
  res.send(user);
});

router.post("/users", async (req, res) => {
  const { userToken } = req.body;
  if (!userToken) {
    return res.status(422).send({ error: "You must provide a userToken" });
  }

  try {
    const user = new User(req.body);
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.post("/user/admin/login", async (req, res) => {
  const password = req.body.password;
  if (password === keys.adminPassword) {
    const adminToken =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);
    // save to adminUser
    const adminUser = await User.findById("5f8c717a94198efbb48a6a7f");
    adminUser.userToken = adminToken;
    await adminUser.save();
    res.send({ adminToken, adminMode: true });
  } else {
    res.send({ adminToken: null, adminMode: false });
  }
});

router.post("/user/admin/device", async (req, res) => {
  const deviceId = req.body.deviceId;
  var adminDeviceIds = keys.adminDeviceIds.split(" ");
  if (adminDeviceIds.includes(deviceId)) {
    res.send(true);
  } else {
    res.send(false);
  }
});

router.put("/user/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  Object.assign(user, req.body);
  await user.save();
  res.send(user);
});

router.put("/user/deviceId/:deviceId", async (req, res) => {
  const user = await User.findOne({ userToken: req.params.deviceId });
  const newNickname = req.body.nickname.trim();
  if (user.nickname !== newNickname) {
    const duplicated = await checkIfDuplicated(newNickname);
    if (duplicated) {
      res
        .status(422)
        .send({ error: "Nickname duplicated, please choose another one." });
    } else {
      Object.assign(user, req.body);
      await user.save();
      res.send(user);
    }
  } else {
    Object.assign(user, req.body);
    await user.save();
    res.send(user);
  }
});

module.exports = router;
