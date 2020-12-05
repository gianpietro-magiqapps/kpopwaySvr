const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userToken: String,
  nickname: String,
  avatar: String,
  color: String,
  lastVoted: Date,
  lastVotedSong: Date,
  lastVotedArtist: Date,
  lastCommented: Date,
});

mongoose.model("User", userSchema);
