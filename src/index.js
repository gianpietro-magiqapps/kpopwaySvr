require("./models/Artist");
require("./models/Song");
require("./models/User");
require("./models/Event");
require("./models/Program");
require("./models/Setting");
require("./models/News");
const os = require("os");
const http = require("http");
const cluster = require("cluster");
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

const numCPUs = os.cpus().length;
// Mongoose connection

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

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", function() {
  mongoose.connection.close(function() {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

// Cluster
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork(); // Create a New Worker, If Worker is Dead
  });
} else {
  // Express middleware
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

  // App routes
  app.get("/", (req, res) => {
    res.send("Hi there!");
  });

  // Server
  http.createServer(app).listen(process.env.PORT || 3000, function() {
    console.log(
      "Express server listening on port 3000 as Worker " +
        cluster.worker.id +
        " running @ process " +
        cluster.worker.process.pid +
        "!"
    );
  });
}
