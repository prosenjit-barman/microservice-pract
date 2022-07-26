/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const Tour = require('./../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//Middleware to manipulate the query for top 5 tours or something like that
//the properties like limit, sort and fields will get the value specified there
//This middleware is prefilling the parts of the query object before it reach the handler

//Image Upload for Tours and procesing them.

const multerStorage = multer.memoryStorage(); //The image will be stored in a buffer in this way. n

//Multer Filter
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an Image. Please upload only images', 400), false);
    }
} //this function will check if the uploaded file is an image. non image type files will not be uploaded

// All About Multer
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3},
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  
  if(!req.files.imageCover || req.files.images) return next();

  // 1) Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({ quality: 90})
  .toFile(`public/img/tours/${req.body.imageCover}`); //it will create an object so that we can chain multiple option to process the image
  
  // 2) Images
  req.body.images = [];

  await Promise.all (
    req.files.images.map(async (file, i) => {

    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    
    await sharp(file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90})
    .toFile(`public/img/tours/${filename}`); //it will create an object so that we can chain multiple option to process the image
  
    req.body.images.push(filename);
  })
);

  next();

});
// upload.single('image')
// upload.array('images', 5)

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficult';
    next();
};

//creating a reusable model that we can use with other controllers
// class APIFeatures {
//     constructor(query, queryString) {
//         this.query = query;
//         this.queryString = queryString;
//     }

//     filter() {
//         Filtering
//         const queryObj = {...this.queryString};//... is destructuring. all the fields out of the object. Since withing the curly braces, a new object will be created
//         const excludedFields = ['page', 'sort', 'limit', 'fields']; //excluding field from query string
//         excludedFields.forEach(el => delete queryObj[el]); //a loop to search for the excluded fields

//         console.log(req.query, queryObj); //formatted data from query string will be displayed
//         Advance Filtering
//         let queryStr = JSON.stringify(queryObj);
//         queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);//replacing mongodb operator with a $ sign ahead. Used regular expression here
//         console.log(JSON.parse(queryStr));
//         this.query = this.query.find(JSON.parse(queryStr));
//         let query = Tour.find(JSON.parse(queryStr)); //Finding all documents/collections from the database using mongoose. Find method will return an array. Filter object

//         return this;
//     }

// }


//Need to read the data before sending. 
/*const tours = JSON.parse(
    fs.readFileSync('${__dirname}/../dev-data/data/tours-simple.json')
    );*/ //Testing Purpose

//If code is similar, we can create a Param Middleware and perform the check withing the middleware that will run before the request hits the handler function.
//exports.checkID = (req, res, next, val) => {
  //  console.log('Tour Id is: ' + val); //Val parameter with hold the value of the id parameter
    
    //if(req.params.id * 1 > tours.length){
      //  return res.status(404).json({
        //    Status: "Failed",
          //  Message: "Invalid ID"
        //}); //Need to make sure that return is called. in case of defining middleware.
    //}
    //next();
//};

//Chaining Middleware, the POST stack
/*exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            Status: "failed",
            Message: "Missing Name or price"
        });
    }
    next();
};*/

//Export all of the Handler function
//The Call back function will run inside the Event Loop

//Handler Factory Handling all Things
exports.getAllTours = factory.getAll(Tour);

//Handler Factory Handling All things
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

//Handler Factory Handling All things
exports.createTour = factory.createOne(Tour);

//Handler Factory Handling All things
exports.updateTour = factory.updateOne(Tour);

//Handler Factory Handling All things
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req,res, next) => {
//         const tour = await Tour.findByIdAndDelete(req.params.id)
        
//         if(!tour) {
//           return next(new AppError('No Tour Found with that ID', 404));
//         }

//         res.status(204).json({
//             status: "Success",
//             data: null
//         });
// });


exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      // SEARCH THE MONGODB DOCUMENTATION FOR MORE
      // AGGREGATION PIPELINE STAGES, OPERATORS, METHODS.
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numRatings: { $sum: '$ratingsQuantity' },
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // WE CAN USE MULTIPLE MATCHES, BELOW WE USE ( $ne -> NOT EQUAL TO EASY)
    //    {
    //     $match: { _id: { $ne: 'EASY' } },
    //    },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  });

  //getting monthly plan
  exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
        const year = req.params.year * 1; //*1 because it transforms into a nr
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' }, //adds a field
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 6, //limits the result to only 6
      },
    ]);
    res.status(200).json({
        status: 'success',
        nrOfResults: plan.length,
        data: {
          plan,
        }
  });
  });

//('/tours-within/:distance/center/:latlng/unit/:unit', tourController.getToursWithin)//distance means the meter of distance from the center(where living) and latlng mean latitude and longitude. distance will be within miles and latlng will gold the coordintates.
// /tours-within/223/center/22.3395259,91.8420835/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params; //destructuring done here to get all pof the variable in once
  const [lat, lng] = latlng.split(','); //destructuring the latlng value and saving them in two sperate variable in array

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //for miles, the radius of earth is 3963.2 miles and for KM, it is 6378.1 kilometer. Dividing the radius of earth it with the distancewithin will bring the required radius.
  //if we actually have the lattitude and longtitude in a required format.
  if(!lat || !lng) {
    next(new AppError('Please Provide Latitude and lontitude in the format lat, lng.', 400)
    );
  };

  const tours = await Tour.find({ 
    startLocation: { $geoWithin: 
      { $centerSphere: [[lng, lat], radius] } 
    } 
  }); //geowithin helps to find documents within specific radius. For that reason, we also need to include centerSphere to get the data in a radius from center location. Lontitude will always in first and then lattitude. After specifying the center of the sphere, we need to include the radius also.
  //console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params; //destructuring done here to get all pof the variable in once
  const [lat, lng] = latlng.split(','); //destructuring the latlng value and saving them in two sperate variable in array

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  //if we actually have the lattitude and longtitude in a required format.
  if(!lat || !lng) {
    next(new AppError('Please Provide Latitude and lontitude in the format lat, lng.', 400)
    );
  };

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        }, //hear, new is the longtitude and lattitude. We will calculate the distance from destinantion to lnglat.
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});