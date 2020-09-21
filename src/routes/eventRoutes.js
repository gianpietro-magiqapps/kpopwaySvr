const express = require("express");
const mongoose = require("mongoose");

const Event = mongoose.model("Event");

const router = express.Router();

router.get("/events", async (req, res) => {
  const events = await Event.find().sort({
    startDate: "asc",
  });
  res.send(events);
});

router.get("/event/:id", async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  res.send(event);
});

router.post("/events", async (req, res) => {
  const { name, startDate, endDate } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(422).send({ error: "You must provide a name and dates" });
  }

  try {
    const event = new Event(req.body);
    await event.save();
    res.send(event);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/event/:id", async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  Object.assign(event, req.body);
  await event.save();
  res.send(event);
});

module.exports = router;
