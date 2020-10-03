const express = require("express");
const mongoose = require("mongoose");

const Event = mongoose.model("Event");

const router = express.Router();

router.get("/events", async (req, res) => {
  const { radio } = req.query;
  const events = await Event.find({ radio })
    .sort({
      day: "asc",
      startTime: "asc",
    })
    .populate("program");
  res.send(events);
});

router.get("/event/:id", async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id }).populate("program");
  res.send(event);
});

router.post("/events", async (req, res) => {
  const { program, startTime, endTime } = req.body;
  if (!program || !startTime || !endTime) {
    return res
      .status(422)
      .send({ error: "You must provide a program name and times" });
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
