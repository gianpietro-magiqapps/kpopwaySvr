const mongoose = require("mongoose");

const votesSchema = new mongoose.Schema({
  userToken: String,
  lastVoted: Date,
  votes: Number,
});

const songSchema = new mongoose.Schema({
  name: String,
  artistId: {
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
});

mongoose.model("Song", songSchema);
