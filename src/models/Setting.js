const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  rewardCredits: Number,
});

mongoose.model("Setting", settingSchema);
