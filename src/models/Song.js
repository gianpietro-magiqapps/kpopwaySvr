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
  rankingVotes: [votesSchema],
  totalVotes: {
    type: Number,
    default: function() {
      let votesSum = 0;
      return this.rankingVotes.map((vote) => {
        console.log("sum", votesSum);
        console.log("votes", vote.votes);
        return (votesSum += parseInt(vote.votes));
      });
    },
  },
});

mongoose.model("Song", songSchema);
