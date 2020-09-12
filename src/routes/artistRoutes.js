const express = require("express");
const mongoose = require("mongoose");

const Artist = mongoose.model("Artist");

const router = express.Router();

router.get("/artists", async (req, res) => {
  const inRewards = req.query.inRewards || false;
  const artists = inRewards
    ? await Artist.find({ inRewards: inRewards }).sort({
        broadcastCredits: "desc",
      })
    : await Artist.find();
  res.send(artists);
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

router.put("/artist/:id", async (req, res) => {
  const artist = await Artist.findOne({ _id: req.params.id });
  Object.assign(artist, req.body);
  await artist.save();
  res.send(artist);
});

module.exports = router;
