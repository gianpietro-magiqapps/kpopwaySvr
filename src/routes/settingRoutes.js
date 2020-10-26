const express = require("express");
const mongoose = require("mongoose");

const Setting = mongoose.model("Setting");

const router = express.Router();

router.get("/settings", async (req, res) => {
  const rewardCredits = await Setting.findOne().rewardCredits;
  res.send(rewardCredits);
});

router.post("/settings", async (req, res) => {
  const settings = new Setting(req.body);
  await settings.save();
  res.send(settings);
});

module.exports = router;
