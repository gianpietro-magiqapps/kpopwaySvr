const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const keys = require("../config/keys");
const Member = mongoose.model("Member");

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ error: "You must be admin." });
  }

  const token = authorization.replace("Bearer ", "");
  const adminUser = await User.findById("5f8c717a94198efbb48a6a7f");
  const adminToken = adminUser.userToken;
  if (token === adminToken) {
    next();
  } else {
    res.status(401).send({ error: "You must be admin." });
  }
};
