const express = require("express");
const mongoose = require("mongoose");

const Song = mongoose.model("Song");

const router = express.Router();

router.get("/songs", async (req, res) => {
  const inRanking = req.query.inRanking || false;
  const songs = inRanking
    ? await Song.find({ inRanking: inRanking }).sort({
        totalVotes: "desc",
      })
    : await Song.find().sort({
        name: "asc",
      });
  res.send(songs);
});

router.get("/song/:id", async (req, res) => {
  const song = await Song.findOne({ _id: req.params.id });
  res.send(song);
});

router.post("/songs", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(422).send({ error: "You must provide a name" });
  }

  try {
    const song = new Song(req.body);
    await song.save();
    res.send(song);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/song/:id/addVotes", async (req, res) => {
  const song = await Song.findOneAndUpdate(
    { _id: req.params.id },
    { $inc: { "rankingVotes.$[el].votes": parseInt(req.query.votes) } },
    {
      arrayFilters: [{ "el.userToken": req.query.userToken }],
      new: true,
    }
  );
  // update Votes
  let totalVotes = 0;
  song.rankingVotes.map((vote) => {
    return (totalVotes += parseInt(vote.votes));
  });
  song.totalVotes = totalVotes;
  await song.save();
  // update currentPosition
  const songs = await Song.find({ inRanking: inRanking }).sort({
    totalVotes: "desc",
  });
  var i;
  for (i = 0; i < songs.length; i++) {
    song[i].currentPosition = i + 1;
    await song.save();
  }
  res.send(song);
});

router.put("/song/:id", async (req, res) => {
  const song = await Song.findOne({ _id: req.params.id });
  Object.assign(song, req.body);
  await song.save();
  res.send(song);
});

module.exports = router;
