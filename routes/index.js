var express = require("express");
var multer = require("multer");
var router = express.Router();
var Admin = require("../models/Admin");
var Cinemas = require("../models/Cinemas");
var Movies = require("../models/Movies");
var Times = require("../models/Times");
var Seats = require("../models/Seats");
var Bookings = require("../models/Bookings");
const upload = multer({ dest: "public/images/uploads" });

/* GET home page. */
router.get("/", async function (req, res, next) {
  const cinemas = await Cinemas.find({});
  res.render("index", { cinemas: cinemas });
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.get("/register", function (req, res) {
  res.render("register");
});

router.post("/register", async function (req, res) {
  if (req.body.code == "dreamci2024") {
    const admin = new Admin();
    admin.email = req.body.email;
    admin.password = req.body.password;
    const data = await admin.save();
    console.log(data);
    res.redirect("/login");
  } else {
    res.redirect("/register");
  }
});

router.post("/login", async function (req, res) {
  const admin = await Admin.findOne({ email: req.body.email });
  if (admin != null && Admin.compare(req.body.password, admin.password)) {
    req.session.admin = {
      id: admin._id,
      email: admin.email,
    };
    res.redirect("/admin");
  } else {
    res.redirect("/login");
  }
});

router.get("/blank", function (req, res) {
  res.render("blank");
});

router.get("/cinemadetail/:id", async function (req, res) {
  const cinema = await Cinemas.findById(req.params.id);
  const movies = await Movies.find({
    endDate: { $gte: Date.now() },
    cinemaId: req.params.id,
  });
  console.log(movies);
  res.render("cinemadetail", { cinema: cinema, movies: movies });
});

router.get("/moviedetail/:id", async function (req, res) {
  const movie = await Movies.findById(req.params.id).populate(
    "cinemaId",
    "name"
  );
  const time = await Times.findOne({ movieId: req.params.id });
  res.render("moviedetail", { movie: movie, timetable: time.timeTable });
});

router.get("/booking/:id", async function (req, res) {
  const movie = await Movies.findById(req.params.id).populate("cinemaId");
  const time = await Times.findOne({ movieId: req.params.id });
  console.log(time);
  res.render("booking", { movie: movie, time: time });
});

router.post("/checkingSeats", async function (req, res) {
  const seats = await Seats.find({
    cinemaId: req.body.cinemaId,
    screenNo: req.body.screen,
  }).sort({
    row: 1,
    no: 1,
    screenNo: 1,
  });
  let takeSeats = [];
  const bookings = await Bookings.find({
    movieId: req.body.movieId,
    screenNo: req.body.screen,
    time: req.body.time,
    date: req.body.date,
    status: "1",
  });
  bookings.map((obj) => (takeSeats = takeSeats.concat(obj.seat)));
  console.log(takeSeats);
  res.json({ seats: seats, takeSeats: takeSeats });
});

router.post("/submitBooking", async function (req, res) {
  try {
    const bookings = new Bookings();
    bookings.movieId = req.body.movieId;
    bookings.name = req.body.name;
    bookings.phone = req.body.phone;
    bookings.seat = req.body.seat.split(",");
    bookings.price = req.body.price;
    bookings.time = req.body.time;
    bookings.screenNo = req.body.screen;
    bookings.date = req.body.date;
    const data = await bookings.save();
    res.json({ status: true, id: data._id });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/bookingpanel/:id", async function (req, res) {
  const booking = await Bookings.findById(req.params.id).populate("movieId");
  res.render("bookingpanel", { booking: booking });
});

router.post(
  "/bookingreceipt",
  upload.single("receipt"),
  async function (req, res) {
    const update = {
      updated: Date.now(),
    };
    if (req.file) update.receipt = "/images/uploads/" + req.file.filename;
    const booking = await Bookings.findByIdAndUpdate(req.body.id, {
      $set: update,
    });
    res.redirect("/bookingpanel/" + req.body.id);
  }
);

router.get("/cinemas", async function (req, res) {
  const cinemas = await Cinemas.find({});
  res.render("cinemas", { cinemas: cinemas });
});
module.exports = router;
