const express = require("express");
const mongoose = require("mongoose");

const Admin = mongoose.model("Admin");

const router = express.Router();

router.get("/admin/settings", async (req, res) => {
  const rewardCredits = await Admin.findOne().rewardCredits;
  res.send(rewardCredits);
});

router.post("/admin/settings", async (req, res) => {
  const settings = new Admin(req.body);
  await settings.save();
  res.send(settings);
});

module.exports = router;
