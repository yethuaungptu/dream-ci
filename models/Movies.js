const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  cinemaId: {
    type: Schema.Types.ObjectId,
    ref: "Cinemas",
  },
  poster: {
    type: String,
    required: true,
  },
  category: {
    type: [String],
    required: true,
  },
  cast: {
    type: [String],
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  syn: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  trailer: {
    type: String,
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

module.exports = mongoose.model("Movies", MovieSchema);
