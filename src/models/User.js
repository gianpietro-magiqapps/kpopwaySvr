const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userToken: String,
  lastVoted: Date,
});

mongoose.model("Song", userSchema);
