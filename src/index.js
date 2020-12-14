require("./models/Artist");
require("./models/Song");
require("./models/User");
require("./models/Event");
require("./models/Program");
require("./models/Setting");
require("./models/News");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const artistRoutes = require("./routes/artistRoutes");
const songRoutes = require("./routes/songRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const programRoutes = require("./routes/programRoutes");
const settingRoutes = require("./routes/settingRoutes");
const newsRoutes = require("./routes/newsRoutes");
const keys = require("./config/keys");

const app = express();

app.use(bodyParser.json());
app.use(artistRoutes);
app.use(songRoutes);
app.use(uploadRoutes);
app.use(userRoutes);
app.use(eventRoutes);
app.use(programRoutes);
app.use(settingRoutes);
app.use(newsRoutes);

mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.connection.on("connected", () => {
  console.log("connected to MongoDB");
});

// Retry connection
const connectWithRetry = () => {
  console.log("MongoDB connection with retry");
  return mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

// Exit application on error
mongoose.connection.on("error", (err) => {
  console.log(`MongoDB connection error: ${err}`);
  setTimeout(connectWithRetry, 5000);
  // process.exit(-1)
});

app.get("/", (req, res) => {
  res.send("Hi there!");
});

app.listen(process.env.PORT || 3000);
