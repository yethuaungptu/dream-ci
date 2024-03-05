var express = require("express");
var multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "public/images/uploads" });
const cpUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "gallery", maxCount: 4 },
]);
const Cinemas = require("../models/Cinemas");
const Movies = require("../models/Movies");
const Times = require("../models/Times");
const Seats = require("../models/Seats");
const Bookings = require("../models/Bookings");
var router = express.Router();
var checkAdmin = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/login");
  }
};
router.get("/", checkAdmin, async function (req, res) {
  const cinemaCount = await Cinemas.countDocuments({});
  const movieCount = await Movies.countDocuments({});
  const seatCount = await Seats.countDocuments({});
  const bookingCount = await Bookings.countDocuments({});
  res.render("admin/index", {
    cinemaCount,
    movieCount,
    seatCount,
    bookingCount,
  });
});

router.get("/blank", function (req, res) {
  res.render("admin/blank");
});

router.get("/cinemaAdd", checkAdmin, function (req, res) {
  res.render("admin/cinema/add");
});

router.post("/cinemaAdd", checkAdmin, cpUpload, async function (req, res) {
  const spShowTime = req.body.showTime.split(",");
  let gallery = [];
  for (var i = 0; i < req.files.gallery.length; i++) {
    gallery.push("/images/uploads/" + req.files.gallery[i].filename);
  }
  const cinema = new Cinemas();
  cinema.name = req.body.name;
  cinema.address = req.body.address;
  cinema.phone = req.body.phone;
  cinema.noOfScreen = req.body.noOfScreen;
  cinema.showTime = spShowTime;
  if (req.files.cover.length > 0)
    cinema.cover = "/images/uploads/" + req.files.cover[0].filename;
  cinema.gallery = gallery;
  cinema.createdBy = req.session.admin.id;
  cinema.updatedBy = req.session.admin.id;
  const data = await cinema.save();
  console.log(data);
  res.redirect("/admin/cinemaList");
});

router.get("/cinemaList", checkAdmin, async function (req, res) {
  const cinemas = await Cinemas.find().populate("createdBy", "email");
  console.log(cinemas);
  res.render("admin/cinema/list", { cinemas: cinemas });
});

router.get("/cinemaDetail/:id", checkAdmin, async function (req, res) {
  const cinema = await Cinemas.findById(req.params.id)
    .populate("createdBy", "email")
    .populate("updatedBy", "email");
  const movieCount = await Movies.countDocuments({ cinemaId: req.params.id });
  console.log(movieCount);
  res.render("admin/cinema/detail", { cinema: cinema, movieCount: movieCount });
});

router.get("/cinemaUpdate/:id", checkAdmin, async function (req, res) {
  const cinema = await Cinemas.findById(req.params.id);
  res.render("admin/cinema/update", { cinema: cinema });
});

router.post("/cinemaUpdate", checkAdmin, cpUpload, async function (req, res) {
  const update = {
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    showTime: req.body.showTime.split(","),
    noOfScreen: req.body.noOfScreen,
    updated: Date.now(),
    updatedBy: req.session.admin.id,
  };
  const cinema = await Cinemas.findById(req.body.id);
  if (req.files.gallery && req.files.gallery.length > 0) {
    let gallery = [];
    try {
      cinema.gallery.forEach(function (filePath) {
        fs.unlinkSync("public" + filePath);
      });
    } catch (e) {
      console.log("Some was wrong");
    }
    for (var i = 0; i < req.files.gallery.length; i++) {
      gallery.push("/images/uploads/" + req.files.gallery[i].filename);
    }
    update.gallery = gallery;
  }
  if (req.files.cover && req.files.cover.length > 0) {
    update.cover = "/images/uploads/" + req.files.cover[0].filename;
    try {
      fs.unlinkSync("public" + cinema.cover);
    } catch (e) {
      console.log("Something was wrong!!");
    }
  }

  const data = await Cinemas.findByIdAndUpdate(req.body.id, { $set: update });
  res.redirect("/admin/cinemaList");
});

router.get("/cinemaDelete/:id", checkAdmin, async function (req, res) {
  const cinema = await Cinemas.findById(req.params.id);
  if (cinema) {
    try {
      cinema.gallery.forEach(function (filePath) {
        fs.unlinkSync("public" + filePath);
      });
      fs.unlinkSync("public" + cinema.cover);
    } catch (e) {
      console.log("Some was wrong");
    }
    const data = await Cinemas.findByIdAndDelete(req.params.id);
  }
  res.redirect("/admin/cinemaList");
});

router.get("/movieAdd", checkAdmin, async function (req, res) {
  const cinemas = await Cinemas.find({});
  res.render("admin/movie/add", { cinemas: cinemas });
});

router.post(
  "/movieAdd",
  checkAdmin,
  upload.single("poster"),
  async function (req, res) {
    const movies = new Movies();
    movies.title = req.body.title;
    movies.cinemaId = req.body.cinemaId;
    movies.category = req.body.category;
    movies.cast = req.body.cast.split(",");
    movies.director = req.body.director;
    movies.startDate = req.body.startDate;
    movies.endDate = req.body.endDate;
    movies.releaseDate = req.body.releaseDate;
    movies.duration = req.body.duration;
    movies.trailer = req.body.trailer;
    movies.syn = req.body.syn;
    movies.createdBy = req.session.admin.id;
    movies.updatedBy = req.session.admin.id;
    if (req.file) movies.poster = "/images/uploads/" + req.file.filename;
    const data = await movies.save();
    console.log(data);
    res.redirect("/admin");
  }
);

router.get("/movieList", checkAdmin, async function (req, res) {
  const movies = await Movies.find().populate("cinemaId");
  res.render("admin/movie/list", { movies: movies });
});

router.get("/movieDetail/:id", checkAdmin, async function (req, res) {
  const movie = await Movies.findById(req.params.id)
    .populate("cinemaId", "name")
    .populate("createdBy", "email")
    .populate("updatedBy", "email");
  res.render("admin/movie/detail", { movie: movie });
});

router.get("/movieUpdate/:id", checkAdmin, async function (req, res) {
  const movie = await Movies.findById(req.params.id);
  const cinemas = await Cinemas.find({});
  res.render("admin/movie/update", { movie: movie, cinemas: cinemas });
});

router.post(
  "/movieUpdate",
  checkAdmin,
  upload.single("poster"),
  async function (req, res) {
    const movie = await Movies.findById(req.body.id);
    const update = {
      title: req.body.title,
      cinemaId: req.body.cinemaId,
      category: req.body.category,
      cast: req.body.cast.split(","),
      director: req.body.director,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      releaseDate: req.body.releaseDate,
      duration: req.body.duration,
      trailer: req.body.trailer,
      syn: req.body.syn,
      updated: Date.now(),
      updatedBy: req.session.admin.id,
    };
    if (req.file) {
      try {
        fs.unlinkSync("public" + movie.poster);
        update.poster = "/images/uploads/" + req.file.filename;
      } catch (e) {
        console.log("Image error");
      }
    }
    const data = await Movies.findByIdAndUpdate(req.body.id, { $set: update });
    console.log(data);
    res.redirect("/admin/movieList");
  }
);

router.get("/movieDelete/:id", checkAdmin, async function (req, res) {
  const movie = await Movies.findById(req.params.id);
  try {
    fs.unlinkSync("public" + movie.poster);
  } catch (e) {
    console.log("Image error");
  }
  const data = await Movies.findByIdAndDelete(req.params.id);
  res.redirect("/admin/movieList");
});

router.get("/timeManagement", checkAdmin, async function (req, res) {
  const movies = await Movies.find({ endDate: { $gte: Date.now() } }).populate(
    "cinemaId"
  );
  console.log(movies);
  res.render("admin/time/management", { movies: movies });
});

router.post("/checkMovieTimeDup", checkAdmin, async function (req, res) {
  const movie = await Times.findOne({ movieId: req.body.id });
  res.json({ status: movie ? true : false });
});

router.post("/submitTimeTable", checkAdmin, async function (req, res) {
  const time = new Times();
  time.movieId = req.body.movieid;
  time.timeTable = JSON.parse(req.body.timeTable);
  time.createdBy = req.session.admin.id;
  time.updatedBy = req.session.admin.id;
  const data = await time.save();
  console.log(data);
  res.json({ status: true });
});

router.get("/seatManagement", checkAdmin, async function (req, res) {
  const cinemas = await Cinemas.find({});
  res.render("admin/seat/management", { cinemas: cinemas });
});

router.post("/checkCinemaSeat", checkAdmin, async function (req, res) {
  try {
    const seats = await Seats.find({ cinemaId: req.body.id }).sort({
      row: 1,
      no: 1,
      screenNo: 1,
    });
    res.json({ status: true, seats: seats });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.post("/addCinemaSeat", checkAdmin, async function (req, res) {
  try {
    const data = await Seats.findOne({
      cinemaId: req.body.cinemaId,
      row: req.body.row,
      no: req.body.no,
      screenNo: req.body.screenNo,
    });
    if (data != null) {
      res.json({ statusCode: 2 });
    } else {
      const seat = new Seats();
      seat.cinemaId = req.body.cinemaId;
      seat.row = req.body.row;
      seat.no = req.body.no;
      seat.screenNo = req.body.screenNo;
      seat.price = req.body.price;
      seat.noOfSeat = req.body.noOfSeat;
      const seatData = await seat.save();
      console.log(seatData);
      res.json({ statusCode: 1 });
    }
  } catch (e) {
    res.json({ statusCode: 0 });
  }
});

router.get("/bookingManagement", checkAdmin, async function (req, res) {
  const bookings = await Bookings.find()
    .populate("movieId")
    .sort({ created: -1 });
  res.render("admin/booking/management", { bookings: bookings });
});

router.get("/booking/:id", checkAdmin, async function (req, res) {
  const booking = await Bookings.findById(req.params.id).populate("movieId");
  const cinema = await Cinemas.findById(booking.movieId.cinemaId);
  res.render("admin/booking/detail", { booking: booking, cinema: cinema });
});

router.post("/confirmBooking", checkAdmin, async function (req, res) {
  const update = {
    updatedBy: req.session.admin.id,
    updated: Date.now(),
    status: "1",
  };
  try {
    const data = await Bookings.findByIdAndUpdate(req.body.id, {
      $set: update,
    });
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.post("/deleteBooking", checkAdmin, async function (req, res) {
  try {
    const data = await Bookings.findByIdAndDelete(req.body.id);
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/logout", checkAdmin, function (req, res) {
  const data = req.session.destroy();
  res.redirect("/admin");
});
module.exports = router;
