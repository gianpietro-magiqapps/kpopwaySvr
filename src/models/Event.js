const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
  },
  day: Number,
  startTime: String,
  endTime: String,
  radio: String,
});

mongoose.model("Event", eventSchema);
