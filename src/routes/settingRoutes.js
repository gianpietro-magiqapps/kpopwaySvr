const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Setting = mongoose.model("Setting");

const router = express.Router();

router.get("/settings", async (req, res) => {
  const settings = await Setting.findOne();
  res.send(settings);
});

router.post("/settings", requireAuth, async (req, res) => {
  const settings = new Setting(req.body);
  await settings.save();
  res.send(settings);
});

router.put("/settings", requireAuth, async (req, res) => {
  // router.put("/settings", async (req, res) => {
  const settings = await Setting.findOne({});
  Object.assign(settings, req.body);
  await settings.save();
  res.send(settings);
});

module.exports = router;
