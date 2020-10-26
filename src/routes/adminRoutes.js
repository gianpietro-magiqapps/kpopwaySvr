const express = require("express");
const mongoose = require("mongoose");

const Admin = mongoose.model("Admin");

const router = express.Router();

router.get("/admin/rewardCredits", async (req, res) => {
  const rewardCredits = await Admin.findOne({}).rewardCredits;
  res.send(rewardCredits);
});

module.exports = router;
