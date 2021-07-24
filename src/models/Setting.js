const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  rewardCredits: String,
  calendarImage: String,
  rankingTitle: String,
  rankingDeadline: String,
  rankingRestart: String,
  weekstarTitle: String,
  weekstarDeadline: String,
  weekstarRestart: String,
  commentsColors: Array,
  commentsNicknames: Array,
  commentsAvatars: Array,
  fakeDeviceDetection: Boolean,
  songsVotingOverride: Boolean,
  artistsVotingOverride: Boolean,
  commentsLimit: Number,
  initialComments: Number,
  loadComments: Number,
});

mongoose.model('Setting', settingSchema);
