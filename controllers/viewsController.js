const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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
  //2) Build Template

  //3)Render template using the data from 1.
    res.status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tours`,
      tour
    });
  });

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log In to your Account'
  })
}