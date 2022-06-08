//This handler Factory will always return a Function or Controller.
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

//This Handler to Perform Deletion
exports.deleteOne = Model => catchAsync(async (req,res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    
    if(!doc) {
      return next(new AppError('No document Found with that ID', 404));
    }

    res.status(204).json({
        status: "Success",
        data: null
    });
});



exports.updateOne = Model => catchAsync(async (req, res, next) => {
    // if(req.params.id * 1 > tours.length){
    //     return res.status(404).json({
    //         Status: "Failed",
    //         Message: "Invalid ID"
    //     });
    // }
    //Updating new Tour using Mongoos
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });//all types of find method are query method

        if(!doc) {
          return next(new AppError('No Document Found with that ID', 404));
        }

        res.status(200).json({
            status: "Success",
            data: {
                date: doc
            },
        });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    //console.log(req.body);
    //const newId = tours[tours.length-1].id + 1;
    //const newTour = Object.assign(
   //     {id: newId}, req.body
   // ); //Assigning a new ID to the post made on the newID. then assigning the object which is basically the post request with an id.

    //tours.push(newTour);//the new object push to the tours, where the file is getting readen
    //fs.writeFile('./dev-data/data/tours-simple.json', JSON.stringify(tours), err =>{

    

    //Handling Errors using Try Catch
    const doc = await Model.create(req.body)//calling create method directly on the tour model
    res.status(201).json({
            status: 'Success',
            data: {
                data: doc
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

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
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

        let query = Model.findById(req.params.id);
        if(popOptions) query = query.populate(popOptions);
        const doc = await query;

        //Tour.findOne({_id: req.params.id})

        if(!doc) {
          return next(new AppError('No document Found with that ID', 404));
        }

        res.status(200).json({
            status: 'Success',
            data: {
                data: doc
            } //JSEND DATA SPECIFICATION
        });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    //To Allow for nested get all review on tour
    //Allow Nested Route. For GET
    
    let filter = {}
    if(req.params.tourId) filter = { tour: req.params.tourId };

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
        const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

        const doc = await features.query;

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
            results: doc.length,
            data: {
                data: doc
            } //JSEND DATA SPECIFICATION
        });
});