const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Artist = mongoose.model("Artist");

const router = express.Router();

router.get("/artists", async (req, res) => {
  const inRewards = req.query.inRewards || false;
  const artists = inRewards
    ? await Artist.find({ inRewards: inRewards }).sort({
        broadcastCredits: "desc",
      })
    : await Artist.find().sort({
        name: "asc",
      });
  res.send(artists);
});

router.get("/artist/:id", async (req, res) => {
  const artist = await Artist.findOne({ _id: req.params.id });
  res.send(artist);
});

router.post("/artists", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(422).send({ error: "You must provide a name" });
  }

  try {
    const artist = new Artist(req.body);
    await artist.save();
    res.send(artist);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/artist/:id/addBroadcastCredits", requireAuth, async (req, res) => {
  const artist = await Artist.findOneAndUpdate(
    { _id: req.params.id },
    { $inc: { broadcastCredits: parseInt(req.query.credits) } }
  );
  res.send(artist);
});

router.put("/artist/:id", requireAuth, async (req, res) => {
  const artist = await Artist.findOne({ _id: req.params.id });
  Object.assign(artist, req.body);
  await artist.save();
  res.send(artist);
});

router.delete("/artists/credits", requireAuth, async (req, res) => {
  await Artist.updateMany(
    {},
    { $set: { broadcastCredits: 0 } },
    { multi: true }
  );
  res.send("success");
});

module.exports = router;
