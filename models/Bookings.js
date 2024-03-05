const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  movieId: {
    type: Schema.Types.ObjectId,
    ref: "Movies",
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  seat: {
    type: [String],
    required: true,
  },
  price: {
    type: Number,
    required: true, // 1 is avaliable, 0 is taken
  },
  time: {
    type: String,
    required: true,
  },
  screenNo: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "0",
  },
  receipt: {
    type: String,
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

module.exports = mongoose.model("Bookings", BookingSchema);
