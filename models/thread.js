const mongoose = require('mongoose');

const repliesSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: false,
  },
  created_on: {
    type: String,
    required: true,
    unique: false,
  },
  bumped_on: {
    type: String,
    required: true,
    unique: false,
  },
  delete_password: {
    type: String,
    required: true,
    unique: false,
    select: false,
  },
  reported: {
    type: Boolean,
    required: true,
    unique: false,
    select: false,
  },
});

const ThreadSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: false,
  },
  created_on: {
    type: String,
    required: true,
    unique: false,
  },
  bumped_on: {
    type: String,
    required: true,
    unique: false,
  },
  replies: {
    type: [repliesSchema],
  },
  replycount: {
    type: Number,
    required: true,
    unique: false,
  },
  delete_password: {
    type: String,
    required: true,
    unique: false,
    select: false,
  },
  reported: {
    type: Boolean,
    required: true,
    unique: false,
    select: false,
  },
});

module.exports = ThreadSchema;
