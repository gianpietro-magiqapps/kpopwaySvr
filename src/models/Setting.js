const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  rewardCredits: String,
  calendarImage: String,
  rankingTitle: String,
  rankingDeadline: String,
  rankingRestart: String,
  commentsColors: Array,
  commentsNicknames: Array,
  commentsAvatars: Array,
});

mongoose.model("Setting", settingSchema);
