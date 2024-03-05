const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CinemaSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
  },
  gallery: {
    type: [String],
  },
  showTime: {
    type: [String],
    required: true,
  },
  noOfScreen: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Admins",
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admins",
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  updated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Cinemas", CinemaSchema);
