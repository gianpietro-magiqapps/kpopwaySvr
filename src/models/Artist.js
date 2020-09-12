const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  inRewards: Boolean,
  broadcastCredits: Number,
});

mongoose.model("Artist", artistSchema);
