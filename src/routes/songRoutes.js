const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");

const Song = mongoose.model("Song");
const User = mongoose.model("User");

const router = express.Router();

const updatePositions = async () => {
  let songs = await Song.find({ inRanking: true }).sort({
    totalVotes: "desc",
  });
  var i;
  for (i = 0; i < songs.length; i++) {
    const rankingSong = songs[i];
    rankingSong.currentPosition = i + 1;
    await rankingSong.save();
  }
  songs = await Song.find({ inRanking: true })
    .populate("artist")
    .sort({
      totalVotes: "desc",
    });
  return songs;
};

const updateTotalVotes = async (song) => {
  let totalVotes = 0;
  song.rankingVotes.map((vote) => {
    return (totalVotes += parseInt(vote.votes));
  });
  totalVotes = totalVotes + song.adminVotes;
  song.totalVotes = totalVotes <= 999999 ? totalVotes : 999999;
  await song.save();
};

const userCanVote = (lastVoted, now) => {
  if (Math.abs(lastVoted - now) <= 900000) {
    return "paused";
  }
  return "enabled";
};

const votingDisabled = (now) => {
  if (
    (now.format("dddd") === "Monday" && now.format("HH") >= 10) ||
    (now.format("dddd") === "Tuesday" && now.format("HH") < 10)
  ) {
    return true;
  }
  return false;
};

router.get("/songs", async (req, res) => {
  const inRanking = req.query.inRanking || false;
  const songs = inRanking
    ? await Song.find({ inRanking: inRanking })
        .populate("artist")
        .sort({
          currentPosition: "asc",
        })
    : await Song.find()
        .populate("artist")
        .sort({
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
    updatePositions();

    res.send(song);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/song/:id/addVotes", async (req, res) => {
  const now = moment().utcOffset("+09:00");
  if (votingDisabled(now)) {
    res.status(422).send({
      error: "Voting disabled, restarts on Tuesday 10am KST",
    });
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
        await updateTotalVotes(song);
        // update currentPositions
        const rankingSongs = await updatePositions();
        res.send(rankingSongs);
      } else {
        // can't vote
        res.status(422).send({ error: "You can vote ONCE every 15 minutes." });
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
      await updateTotalVotes(song);
      // update currentPositions
      const rankingSongs = await updatePositions();
      res.send(rankingSongs);
    }
  }
});

router.put("/song/:id", async (req, res) => {
  const song = await Song.findOne({ _id: req.params.id });
  Object.assign(song, req.body);
  await song.save();
  // update Votes
  await updateTotalVotes(song);
  // update currentPositions
  const rankingSongs = await updatePositions();
  res.send(rankingSongs);
});

router.delete("/songs/votes", async (req, res) => {
  await Song.updateMany(
    {},
    { $set: { rankingVotes: [], adminVotes: 0, totalVotes: 0 } },
    { multi: true }
  );
  await User.remove({});
  res.send("success");
});

module.exports = router;
