const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  body: String,
  date: Date,
});

const newsSchema = new mongoose.Schema({
  title: String,
  body: String,
  image: String,
  date: Date,
  comments: [commentsSchema],
});

mongoose.model("News", newsSchema);
