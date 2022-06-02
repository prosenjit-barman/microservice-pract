/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//Middleware to manipulate the query for top 5 tours or something like that
//the properties like limit, sort and fields will get the value specified there
//This middleware is prefilling the parts of the query object before it reach the handler
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
exports.getAllTours = catchAsync(async (req, res, next) => {
    //console.log(req.requestTime);

    //Error handling
        //console.log(req.query);

        //shallow copy of the request query object. A hard copy
        //removing extra field name from filtering
        //BUILD QUERY
        //Filtering
        // const queryObj = {...req.query};//... is destructuring. all the fields out of the object. Since withing the curly braces, a new object will be created
        // const excludedFields = ['page', 'sort', 'limit', 'fields']; //excluding field from query string
        // excludedFields.forEach(el => delete queryObj[el]); //a loop to search for the excluded fields

        // //console.log(req.query, queryObj); //formatted data from query string will be displayed
        // //Advance Filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);//replacing mongodb operator with a $ sign ahead. Used regular expression here
        // //console.log(JSON.parse(queryStr));

        // let query = Tour.find(JSON.parse(queryStr)); //Finding all documents/collections from the database using mongoose. Find method will return an array. Filter object
        
        // //Sorting
        // if(req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        //     //sort('price ratingsAverage'); sorting by multiple condition
        // } else {
        //     query = query.sort('-createdAt')
        // }

        // //FIELD LIMITING
        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');//splitting the query parameters by comma and then jpoining them
        //     query = query.select(fields);//in response, this will return the fields that are specificed in parameter
        //     //console.log(fields)
        // } else {
        //     query = query.select('-__v');//in response, this field will be excluded
        // }

        // //PAGINATION
        // //User wants to see page and the results per page 1-10 on page 1, 11-20 on page 2
        // //We want to display the pagination even if the user doesn't choose any pagination. Don't want to display all results.

        // const page = parseInt(req.query.page) || 1; //getting the page from query string. multiplying by one is converting string to a number
        // const limit = parseInt(req.query.limit) || 100; //limiting the result
        // const skip = (page - 1); //if we are requesting page 3, then the result will be start from 21. This formula will skip result based on the limit and previous page result 
        // const skipPage = skip * limit;
        // query = query.skip(skipPage).limit(limit); //the amount of result should be skipped before querying and limiting the data display

        // if(req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error("This page doesn't exist");
        // }
        //FILTER OBJECT { difficulty: 'easy', duration: {$gte: 5} }
        //gte,gt,lte,lt
        //EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

        const tours = await features.query;

        //another way of writing DB query
        //using mongoose methods
        // const tours =  Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy');

        //SEND RESPONSE
        res.status(200).json({
            status: 'Success',
            //requestedAt: req.requestTime,
            results: tours.length,
            data: {
                tours
            } //JSEND DATA SPECIFICATION
        });
});

exports.getTour = catchAsync(async (req, res, next) => {
    //console.log(req.params); //will display the request paramater on console

    //const id = req.params.id * 1; //way of converting a string to a number. When a String is multiplied by a number, it will be converted to a string.

    /*const tour = tours.find(el => el.id === id);//loop through the array and each iteration will return a true or false value.

    //If no post according to the id
    // if(id > tours.length){
    //  if(!tour){
    //     return res.status(404).json({
    //         Status: "Failed",
    //         Message: "Invalid ID"
    //     });
    // }
    
    res.status(200).json({
        status: 'Success',
        data: {
            tour
        } //JSEND DATA SPECIFICATION
    });*/
    //finding Tour by ID of the mongodb
        const tour = await Tour.findById(req.params.id).populate('reviews');//feathcing the ID from DB
        //Tour.findOne({_id: req.params.id})

        if(!tour) {
          return next(new AppError('No Tour Found with that ID', 404));
        }

        res.status(200).json({
            status: 'Success',
            data: {
                tour
            } //JSEND DATA SPECIFICATION
        });
});

exports.createTour = catchAsync(async (req, res, next) => {
    //console.log(req.body);
    //const newId = tours[tours.length-1].id + 1;
    //const newTour = Object.assign(
   //     {id: newId}, req.body
   // ); //Assigning a new ID to the post made on the newID. then assigning the object which is basically the post request with an id.

    //tours.push(newTour);//the new object push to the tours, where the file is getting readen
    //fs.writeFile('./dev-data/data/tours-simple.json', JSON.stringify(tours), err =>{

    

    //Handling Errors using Try Catch
    const newTour = await Tour.create(req.body)//calling create method directly on the tour model
    res.status(201).json({
            status: 'Success',
            data: {
                tour: newTour
            }
        });

    // try{
    //     //Creating new tour based on the data that comes on the body
    
    // } catch(err){
    //     res.status(404).json({
    //         status: 'Failed',
    //         message: err
    //     });
    //}
    
    //}); //when inside of a callback function, and it is going to run in event loop. To prevent the block, which can happen due to synchronization, we use writefile. Stringify is making the content to JSON
});

exports.updateTour = catchAsync(async (req, res, next) => {
    // if(req.params.id * 1 > tours.length){
    //     return res.status(404).json({
    //         Status: "Failed",
    //         Message: "Invalid ID"
    //     });
    // }
    //Updating new Tour using Mongoos
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });//all types of find method are query method

        if(!tour) {
          return next(new AppError('No Tour Found with that ID', 404));
        }

        res.status(200).json({
            status: "Success",
            data: {
                tour
            },
        });
});

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