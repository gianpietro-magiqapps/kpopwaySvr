const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  rewardCredits: String,
});

mongoose.model("Setting", settingSchema);
