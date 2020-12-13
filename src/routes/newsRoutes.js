const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const requireAuth = require("../middlewares/requireAuth");

const News = mongoose.model("News");
const User = mongoose.model("User");
const Setting = mongoose.model("Setting");

const router = express.Router();

router.get("/news", async (req, res) => {
  const news = await News.find()
    .sort({
      date: "desc",
    })
    .populate("comments.userId");
  res.send(news);
});

router.get("/news/:id", async (req, res) => {
  const news = await News.findOne({ _id: req.params.id }).populate(
    "comments.userId"
  );
  res.send(news);
});

router.post("/news", requireAuth, async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(422).send({ error: "You must provide a title" });
  }

  try {
    const news = new News(req.body);
    news.date = new Date();
    await news.save();

    res.send(news);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/news/:id/comment", async (req, res) => {
  const now = moment().utcOffset("+09:00");

  const { userToken, comment } = req.query;
  const newsId = req.params.id;
  const user = await User.findOne({ userToken });
  const news = await News.findOne({ _id: newsId });

  if (user) {
    // user exists, commenting
    // check if it needs a default nick, avatar and color first
    if (!user.nickname) {
      const settings = await Setting.findOne();
      const randomNames = settings.commentsNicknames;
      const randomAvatars = settings.commentsAvatars;
      const randomColors = settings.commentsColors;
      user.nickname =
        randomNames[Math.floor(Math.random() * randomNames.length)];
      user.avatar =
        randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
      user.color =
        randomColors[Math.floor(Math.random() * randomColors.length)];
    }
    let newComment = {
      userId: user._id,
      userName: user.nickname,
      body: comment,
      date: now,
    };
    user.lastCommented = now;
    await user.save();
    await news.comments.push(newComment);
  } else {
    // create new user
    const settings = await Setting.findOne();
    const randomNames = settings.commentsNicknames;
    const randomAvatars = settings.commentsAvatars;
    const randomColors = settings.commentsColors;
    const newNickname =
      randomNames[Math.floor(Math.random() * randomNames.length)];
    const newAvatar =
      randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
    const newColor =
      randomColors[Math.floor(Math.random() * randomColors.length)];
    const newUser = new User({
      userToken,
      nickname: newNickname,
      avatar: newAvatar,
      color: newColor,
    });
    await newUser.save();
    // create new comment
    let newComment = {
      userId: newUser._id,
      userName: newUser.nickname,
      body: comment,
      date: now,
    };
    newUser.lastCommented = now;
    await newUser.save();
    await news.comments.push(newComment);
  }
  await news.save();
  const updatedNews = await News.findOne({ _id: newsId }).populate(
    "comments.userId"
  );
  res.send(updatedNews);
});

router.put("/news/:id", requireAuth, async (req, res) => {
  const news = await News.findOne({ _id: req.params.id });
  Object.assign(news, req.body);
  await news.save();
  res.send(news);
});

router.delete("/news/:id", requireAuth, async (req, res) => {
  await News.deleteOne({ _id: req.params.id });
  res.send("success");
});

router.delete("/news/:id/:comment_id", async (req, res) => {
  const user = await User.findOne({ _id: req.query.userId });
  if (
    user.isAdmin ||
    user._id.toString() === req.query.commentUserId.toString()
  ) {
    await News.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.comment_id } } },
      { safe: true, upsert: true }
    );
  }
  const updatedNews = await News.findOne({ _id: req.params.id }).populate(
    "comments.userId"
  );
  res.send(updatedNews);
});

module.exports = router;
