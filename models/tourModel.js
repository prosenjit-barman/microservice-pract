/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
//const validator = require('validator');


//Defining Schema for tours
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A Tour Must have a Name'],//built in data validation is required type
      unique: true,
      trim: true,
      maxlength: [40, 'A Tour Name Must Have Less or Equal 40 Characters'],
      minlength: [10, 'A Tour Name Must Have More or Equal 10 Characters'],
      //validate: [validator.isAlpha, 'Tour Name Must Only Contains Characters']//Demonstrate Purpose using the Validator Library
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty Level'],
        enum: {
          values: ['easy', 'medium', 'difficult'],
          message: 'Difficulty is either: easy, medium or difficult'
        } 
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating Must be above 1.0'],
      max: [5, 'Rating Must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A Tour Must have a Price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //this only points to current doc or new document creation
          return val < this.price; //if the price discount is 100 and actual price is 200. discount should always be lower
        },
        message: 'Discount Price Given:({VALUE}) Should Be Less Than The Regular Price'
      }
    },
    summary: {
        type: String,
        trim: true, //trim will remove all the whitespace in the begining and the end
        required: [true, 'A Tour Must have a Summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A Tour Must have a Cover Image']
    },
    images: [String], //to store all the related images in array in Database
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    //Embedded Doc of Tour Start
    startLocation: {
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
        //Always start with capital letter.
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    //Embedded Doc of Tour End
//Referencing
    guides: [
      {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
    ]
    //Embedded Doc of User Start
    //guides: Array,

    //Referencing
    
  },
  //schema definition
  //Schema options
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
  }); //Arrow function doesn't get the this keyword. it can only be used with the regular function. This is pointing to the current document. This can't be used as query parameter
  
  //Document Middleware. Defining Middleware. Pre Middleware will run before actual event. Save is event. run before .save() and .create()
  tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    //console.log(this);
    next();
  });//this is the currently processed document. Pre save hook

  // Embedding Users with Tours
  //tourSchema.pre('save', async function(next) {
  //   const guidesPromises = this.guides.map(async id => await User.findById(id));
  //   this.guides = await Promise.all(guidesPromises);
  //   next();
  // });

  // tourSchema.pre('save', function(next) {
  //   console.log('Will save document...');
  //   next();
  // });

  // tourSchema.post('save', function(doc, next) {
  //   console.log(doc);
  //   next();
  // });//post middleware will work after all the pre middleware completed

  //QUERY MIDDLEWARE using the Regular express. all the query starts with find: ^find
  tourSchema.pre(/^find/, function(next) {
    //tourSchema.pre('find', function(next) {
        this.find({ secretTour: {$ne: true} });
        //clock to how long the query will be executed
        this.start = Date.now();
      next();
  
    });

    tourSchema.pre(/^find/, function(next) {
      
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    });

    next();
  });
    //POST QUERY MIDDLEWARE
    tourSchema.post(/^find/, function(docs, next) {
      //tourSchema.pre('find', function(next) {
        console.log(`Query took ${Date.now() - this.start} milliseconds`); //will display how long the query takes.
        //console.log(docs);
        next();
      });
  
      //AGREGATION MIDDLEWARE
      tourSchema.pre('aggregate', function(next) {
        this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });//removing all the secret tours from the document
        console.log(this.pipeline());
        next();
      });

      
  //Creating Model for Tour out of the Tour Schema
  const Tour = mongoose.model('Tour', tourSchema);

  module.exports = Tour;