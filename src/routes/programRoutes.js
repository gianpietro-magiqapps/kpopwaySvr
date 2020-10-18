const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Program = mongoose.model("Program");

const router = express.Router();

router.get("/programs", async (req, res) => {
  const programs = await Program.find().sort({
    name: "asc",
  });
  res.send(programs);
});

router.get("/program/:id", async (req, res) => {
  const program = await Program.findOne({ _id: req.params.id });
  res.send(program);
});

router.post("/programs", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(422).send({ error: "You must provide a name" });
  }

  try {
    const program = new Program(req.body);
    await program.save();
    res.send(program);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/program/:id", requireAuth, async (req, res) => {
  const program = await Program.findOne({ _id: req.params.id });
  Object.assign(program, req.body);
  await program.save();
  res.send(program);
});

module.exports = router;
