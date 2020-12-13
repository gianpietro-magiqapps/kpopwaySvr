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
  isBanned: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

mongoose.model("User", userSchema);
