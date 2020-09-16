const express = require("express");
const mongoose = require("mongoose");

const Song = mongoose.model("Song");
const User = mongoose.model("User");

const router = express.Router();

const updatePositions = async () => {
  const songs = await Song.find({ inRanking: true }).sort({
    totalVotes: "desc",
  });
  var i;
  for (i = 0; i < songs.length; i++) {
    const rankingSong = songs[i];
    rankingSong.currentPosition = i + 1;
    await rankingSong.save();
  }
  return await Song.find({ inRanking: true }).sort({
    totalVotes: "desc",
  });
};

const updateTotalVotes = async (song) => {
  let totalVotes = 0;
  song.rankingVotes.map((vote) => {
    return (totalVotes += parseInt(vote.votes));
  });
  song.totalVotes = totalVotes;
  await song.save();
};

const userCanVote = (lastVoted, now) => {
  if (Math.abs(lastVoted - now) <= 60000) {
    return "paused";
  }
  return "enabled";
};

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

    // update currentPositions
    const rankingSongs = updatePositions();

    res.send(rankingSongs);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/song/:id/addVotes", async (req, res) => {
  const now = new Date();
  if (now.getMinutes() > 50) {
    res.status(422).send({ error: "voting is disabled!" });
  } else {
    const { userToken, votes } = req.query;
    const songId = req.params.id;

    const user = await User.findOne({ userToken });

    if (user) {
      // can vote?
      if (userCanVote(user.lastVoted, now) === "enabled") {
        // can vote, check if new song
        const song = await Song.findOne({ _id: songId });

        let voted = false;
        for (var i = 0; i < song.rankingVotes.length; i++) {
          if (song.rankingVotes[i].userId.equals(user._id)) {
            song.rankingVotes[i].votes += parseInt(votes);
            user.lastVoted = now;
            await user.save();
            await song.save();
            voted = true;
            break;
          }
        }

        if (!voted) {
          const vote = { userId: user._id, votes };
          await song.rankingVotes.push(vote);
          user.lastVoted = now;
          await user.save();
          await song.save();
        }

        // update Votes
        updateTotalVotes(song);
        // update currentPositions
        const rankingSongs = updatePositions();
        res.send(rankingSongs);
      } else {
        // can't vote
        res.status(422).send({ error: "You already voted today!" });
      }
    } else {
      // create new user
      const newUser = new User({ userToken, lastVoted: new Date() });
      await newUser.save();
      // create new vote
      const vote = { userId: newUser._id, votes };
      const song = await Song.findOne({ _id: songId });
      await song.rankingVotes.push(vote);
      await song.save();
      // update Votes
      updateTotalVotes(song);
      // update currentPositions
      const rankingSongs = updatePositions();
      res.send(rankingSongs);
    }
  }
});

router.put("/song/:id", async (req, res) => {
  const song = await Song.findOne({ _id: req.params.id });
  Object.assign(song, req.body);
  await song.save();
  res.send(song);
});

module.exports = router;
