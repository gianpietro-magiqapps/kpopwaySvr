const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  rewardCredits: Number,
});

mongoose.model("Admin", adminSchema);
