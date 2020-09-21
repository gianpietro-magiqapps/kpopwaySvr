const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  startDate: Date,
  endDate: Date,
  radio: String,
});

mongoose.model("Event", eventSchema);
