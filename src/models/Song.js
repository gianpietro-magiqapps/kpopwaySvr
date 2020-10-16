const mongoose = require("mongoose");

const votesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  votes: Number,
});

const songSchema = new mongoose.Schema({
  name: String,
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
  },
  image: String,
  inRanking: Boolean,
  weeksInRanking: Number,
  currentPosition: Number,
  previousPosition: Number,
  rankingVotes: [votesSchema],
  totalVotes: {
    type: Number,
    default: 0,
  },
  adminVotes: {
    type: Number,
    default: 0,
  },
});

mongoose.model("Song", songSchema);
