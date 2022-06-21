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

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
      title: 'The Forest Hiker Tour'
    });
  };