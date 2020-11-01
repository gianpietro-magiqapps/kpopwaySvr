const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  rewardCredits: String,
  calendarImage: String,
  rankingTitle: String,
  rankingDeadline: String,
  rankingRestart: String,
});

mongoose.model("Setting", settingSchema);
