const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {

  //1. Get All Tour Data Fro Collection
  const tours = await Tour.find();
  //2. Build Template

  //3. Render that Template using the Tour Data from step 1
    res.status(200).render('overview', {
      title: 'All Tours',
      tours //it is an array
    });
});

exports.getTour = catchAsync(async(req, res, next) => {

  //1) Get The data, for request data including reviews and guides
  const tour = await Tour.findOne({slug: req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  if(!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  //2) Build Template

  //3)Render template using the data from 1.
    res.status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('tour', {
      title: `${tour.name} Tours`,
      tour
    });
  });

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log In to your Account'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up for a new Account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find All Bookings
  const bookings = await Booking.find({ User: req.user.id });
  //2) Find Tours with the Returned ID
  const tourIds = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  })
});
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//     name: req.body.name,
//     email: req.body.email
//   },
//   {
//     new: true,
//     runValidators: true
//   });

//   res.status(200).render('account', {
//     title: 'Your Account',
//     user: updatedUser
//   });

// });