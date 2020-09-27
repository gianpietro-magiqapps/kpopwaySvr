const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  day: String,
  startTime: String,
  endTime: String,
  radio: String,
});

mongoose.model("Event", eventSchema);
