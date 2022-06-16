const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const GlobalErrorhandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
//require express
const app = express();
app.set('view engine', 'pug'); //pug is used as template engine.
app.set('views', path.join(__dirname, 'views')); //path.join will be used to specify the directory name

//Accesing the Static Files on other folder. Middleware defined, static fuction of express default Middleware
//serving static file
app.use(express.static(path.join(__dirname, 'public'))); //Public folder is already set to root

// 1) GLOBAL MIDDLEWARES
//Important security HTTP Header
app.use(helmet());

console.log(process.env.NODE_ENV);
//Dev Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} //Will only display the log in Development environment.

//Rate Limiter for same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too Many requests from this IP. Please Try again in an hour."
});//rate limit is a function that recieves objects as options. Maximum of 100 api request in one hour.

app.use('/api', limiter);

//Defining Middleware
//Body Parser. Reading data from body into req.body
app.use(express.json( { limit: '10kb' })); //express.json is middleware. It is a function that can modify incoming request data. It stands between middle of the request and response. Body data larger than 10Kb will not be accepted.

//Data Sanitization against NoSql query injection
app.use(mongoSanitize()); //this middleware will check req.body, req.querystring and req.params and filtered out all of the $ sign and dots. By removing them, they are not longer gonna work. 

//Data sanitization for XSS attacks.
app.use(xss()); //This xss function will remove any malicious HTML from the input fields to porevent xss attacks.

//Prevent Paramater polution
app.use(hpp({
  whitelist: [
    'duration', 
    'ratingsQuantity', 
    'ratingsAverage', 
    'maxGroupSize', 
    'difficulty', 
    'price'
  ]
})
);


//Creating Middleware
//Next function must be called when creating Middleware
//Middleware must be defined before the request response cycle ends. Top of the code is preferrable.
// app.use((req, res, next) => {
//   console.log('Hello From the Middleware');
//   next();
// });

//Middleware that will display the date with the Response
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

//Third-Party Middleware Morgan which is logging Middleware.
//Morgan function will return something similar to the function on 21st line
//app.use(morgan('tiny'));

//Defining Routes(How an application respond to a request). Then specifying call back function to display the response.
//Sending String response==
// app.get('/', (req, res) => {
//     res.status(200).send('Hello From the Server Side!');
// });

//Sending JSON Object Response
//HTTP method for request=*get method*
// app.get('/', (req, res) => {
//     res.status(200)
//     .json({
//         message: 'Hello From the Server Side!',
//         App: 'Microservice'
//     });
// });

// //HTTP Method for request= *POST Method*
// app.post('/', (req, res) => {
//     res.send('You Can Post To this Endpoint!');
// });

//Specifying API version is the best practice--Defined on Mounting
//Route Handler from app.get()
//The Call back function will run inside the Event Loop
//data: enveloping all the requested data
//app.get('/api/v1/tours', getAllTours);

//Responding to URL parameteres
//tours/:id=specifying the id based search query
//if we need to include optional parameter, just need to include ? like: /api/v1/tours/:id/:x?(it means x paramater is optional)
//app.get('/api/v1/tours/:id', getTour);

//Route Handler: app.post()
//POST request is to send data to the server from client
//Body data should not be send via url as request. In order to have that data available, we need to use MIDDLEWARE
//going to save the data on tour-sample json file
//app.post('/api/v1/tours', createTour);

//Route Handler PATCH
//PATCH= To update data or properties. PUT is to entirely new updated object
//app.patch('/api/v1/tours/:id', updateTour);

//Route Handler DELETE
//app.delete('/api/v1/tours/:id', deleteTour);

//Creating Router for each routes means Mounting

//Router for user resources
//created on tourRoutes.js and userRoutes.js
// Routes
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Prosenjit'
  }) //pass data into template. Need to define a object and some data there. The Data or object defined here are called as locals in pug file 
}); //specifying pug template. It will go directly to the views folder and check for the file and then ender the file.

//Mounting Router comes after defining all the variable
app.use('/api/v1/tours', tourRouter); //connecting new router to the application using Middleware,tourRouter(Mounting)
app.use('/api/v1/users', userRouter); //connecting new router to the application using Middleware,userRouter(Mounting)
app.use('/api/v1/reviews', reviewRouter); //connecting new router to the application using Middleware,userRouter(Mounting)

//ROUTE HANDLER FOR UNDEFINED CONTROLLERS OR HANDLER FUNCTIONS
//This is defined after the tour router because of effective use od the middleware
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Failed',
  //   message: `can't find ${req.originalUrl} on this server!`//`` this is used to insert template string
  // })
  // const err = new Error(`can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));//if this functions gets an argument, express will flag as an error

});//For all URL(*) that doesn't have any handler function defined

//Error Handling Middleware
app.use(GlobalErrorhandler);

module.exports = app;

//Remove route handlers from the routes and seprate them in another folder C0ntrollers
