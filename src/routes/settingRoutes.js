const express = require("express");
const mongoose = require("mongoose");

const Setting = mongoose.model("Setting");

const router = express.Router();

router.get("/settings", async (req, res) => {
  const settings = await Setting.findById("5f96361692e4625a3178dac2");
  res.send(settings);
});

router.post("/settings", async (req, res) => {
  const settings = new Setting(req.body);
  await settings.save();
  res.send(settings);
});

module.exports = router;
