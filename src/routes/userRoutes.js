const express = require("express");
const mongoose = require("mongoose");

const User = mongoose.model("User");

const router = express.Router();

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get("/user/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
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

router.put("/user/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  Object.assign(user, req.body);
  await user.save();
  res.send(user);
});

module.exports = router;
