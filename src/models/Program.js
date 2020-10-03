const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
});

mongoose.model("Program", programSchema);
