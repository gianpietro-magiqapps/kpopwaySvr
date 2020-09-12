require("./models/Artist");
require("./models/Song");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const artistRoutes = require("./routes/artistRoutes");
const keys = require("./config/keys");

const app = express();

app.use(bodyParser.json());
app.use(artistRoutes);

mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("connected to MongoDB");
});
mongoose.connection.on("error", (err) =>
  console.log("Error connecting to mongo", err)
);

app.get("/", (req, res) => {
  res.send("Hi there!");
});

app.listen(process.env.PORT || 3000);
