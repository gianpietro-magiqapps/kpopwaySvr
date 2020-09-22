const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  inRewards: {type: Boolean, default: false},
  broadcastCredits: {type: Number, default: 0},
});

mongoose.model("Artist", artistSchema);
