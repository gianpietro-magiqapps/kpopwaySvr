const mongoose = require("mongoose");

const votesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  votes: Number,
});

const artistSchema = new mongoose.Schema({
  name: String,
  description: String,
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
  inRewards: { type: Boolean, default: false },
  broadcastCredits: { type: Number, default: 0 },
});

mongoose.model("Artist", artistSchema);
