const mongoose = require("mongoose");

const votesSchema = new mongoose.Schema({
  userToken: String,
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
  rankingVotes: [votesSchema],
});

mongoose.model("Song", songSchema);
