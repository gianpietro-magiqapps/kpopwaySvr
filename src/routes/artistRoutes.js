const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const keys = require('../config/keys');
const requireAuth = require('../middlewares/requireAuth');

const Artist = mongoose.model('Artist');
const User = mongoose.model('User');
const Setting = mongoose.model('Setting');

const router = express.Router();

const updatePositions = async () => {
  let artists = await Artist.find({ inRanking: true }).sort({
    totalVotes: 'desc',
  });
  var i;
  for (i = 0; i < artists.length; i++) {
    const rankingArtist = artists[i];
    rankingArtist.currentPosition = i + 1;
    await rankingArtist.save();
  }
  artists = await Artist.find({ inRanking: true }).sort({
    totalVotes: 'desc',
  });
  return artists;
};

const updateTotalVotes = async (artist) => {
  let totalVotes = 0;
  artist.rankingVotes.map((vote) => {
    return (totalVotes += parseInt(vote.votes));
  });
  totalVotes = totalVotes + artist.adminVotes;
  artist.totalVotes = totalVotes <= 999999 ? totalVotes : 999999;
  await artist.save();
};

const userCanVote = (lastVoted, now, userToken) => {
  if (keys.adminDeviceIds.split(' ').includes(userToken) || !lastVoted) {
    return 'enabled';
  }
  if (Math.abs(lastVoted - now) <= 900000) {
    return 'paused';
  }
  return 'enabled';
};

const votingDisabled = async (now) => {
  if (
    (now.format('dddd') === 'Monday' && now.format('HH') >= 10) ||
    (now.format('dddd') === 'Tuesday' && now.format('HH') < 10)
  ) {
    const settings = await Setting.findOne().lean();
    return !settings.artistsVotingOverride;
  }
  return false;
};

router.get('/artists', async (req, res) => {
  const inRewards = req.query.inRewards || false;
  const inRanking = req.query.inRanking || false;
  var artists = [];
  if (inRanking) {
    artists = await Artist.find({ inRanking: inRanking })
      .sort({
        currentPosition: 'asc',
      })
      .select('-rankingVotes');
  } else if (inRewards) {
    artists = await Artist.find({ inRewards: inRewards }).sort({
      broadcastCredits: 'desc',
    });
  } else {
    artists = await Artist.find().sort({
      name: 'asc',
    });
  }
  res.send(artists);
});

router.get('/artist/:id', async (req, res) => {
  const artist = await Artist.findOne({ _id: req.params.id });
  res.send(artist);
});

router.post('/artists', requireAuth, async (req, res) => {
  // router.post("/artists", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(422).send({ error: 'You must provide a name' });
  }

  try {
    const artist = new Artist(req.body);
    await artist.save();

    // update currentPositions
    updatePositions();

    res.send(artist);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put('/artist/:id/addVotes', async (req, res) => {
  const now = moment().utcOffset('+09:00');
  if (await votingDisabled(now)) {
    res.status(422).send({
      error: 'Voting disabled, restarts on Tuesday 10am KST',
    });
  } else {
    const { userToken, votes } = req.query;
    const artistId = req.params.id;

    const user = await User.findOne({ userToken });

    if (user) {
      // can vote?
      let tempLastVoted = user.lastVotedArtist
        ? user.lastVotedArtist
        : user.lastVotedSong
        ? '2000-12-13T16:51:32.885+00:00'
        : user.lastVoted;
      if (userCanVote(tempLastVoted, now, user.userToken) === 'enabled') {
        // can vote, check if new artist
        const artist = await Artist.findOne({
          _id: artistId,
        });
        const artistWithVote = await Artist.findOne({
          _id: artistId,
          'rankingVotes.userId': user._id,
        });

        // update or create new vote
        if (artistWithVote) {
          // update vote count for user
          await Artist.findOneAndUpdate(
            {
              _id: artistId,
              rankingVotes: { $elemMatch: { userId: user._id } },
            },
            { $inc: { 'rankingVotes.$.votes': 1 } },
          );
        } else {
          // new vote object for user
          const vote = { userId: user._id, votes };
          await artist.rankingVotes.push(vote);
          await artist.save();
        }

        // update lastVoted
        user.lastVoted = now;
        user.lastVotedArtist = now;
        await user.save();

        // update Votes
        await updateTotalVotes(artist);
        // update currentPositions
        const rankingArtists = await updatePositions();
        res.send(rankingArtists);
      } else {
        // can't vote
        res.status(422).send({ error: 'You can vote ONCE every 15 minutes.' });
      }
    } else {
      // create new user
      const newUser = new User({
        userToken,
        lastVoted: new Date(),
        lastVotedArtist: new Date(),
      });
      await newUser.save();
      // create new vote
      const vote = { userId: newUser._id, votes };
      const artist = await Artist.findOne({ _id: artistId });
      await artist.rankingVotes.push(vote);
      await artist.save();
      // update Votes
      await updateTotalVotes(artist);
      // update currentPositions
      const rankingArtists = await updatePositions();
      res.send(rankingArtists);
    }
  }
});

router.put('/artist/addFakeVotes', async (req, res) => {
  const { token, name } = req.query;
  console.log('Invalid vote attempt:', token, name);
  res.send('registered');
});

router.put('/artist/:id/addBroadcastCredits', async (req, res) => {
  const artist = await Artist.findOneAndUpdate(
    { _id: req.params.id },
    { $inc: { broadcastCredits: parseInt(req.query.credits) } },
  );
  res.send(artist);
});

router.put('/artist/:id', requireAuth, async (req, res) => {
  // router.put("/artist/:id", async (req, res) => {
  const artist = await Artist.findOne({ _id: req.params.id });
  Object.assign(artist, req.body);
  await artist.save();
  // update Votes
  await updateTotalVotes(artist);
  // update currentPositions
  const rankingArtists = await updatePositions();
  res.send(rankingArtists);
});

router.delete('/artist/:id', requireAuth, async (req, res) => {
  // router.delete("/artist/:id", async (req, res) => {
  const artist = await Artist.findOne({ _id: req.params.id });
  await artist.delete();
  // update currentPositions
  const rankingArtists = await updatePositions();
  res.send(rankingArtists);
});

router.delete('/artists/votes', requireAuth, async (req, res) => {
  // router.delete("/artists/votes", async (req, res) => {
  await Artist.updateMany(
    {},
    { $set: { rankingVotes: [], adminVotes: 0, totalVotes: 0 } },
    { multi: true },
  );
  // Remove all users but admin --> Deprecated to persist comments
  // await User.remove({ _id: { $ne: "5f8c717a94198efbb48a6a7f" } });
  res.send('success');
});

router.delete('/artists/credits', requireAuth, async (req, res) => {
  // router.delete("/artists/credits", async (req, res) => {
  await Artist.updateMany(
    {},
    { $set: { broadcastCredits: 0 } },
    { multi: true },
  );
  res.send('success');
});

module.exports = router;
