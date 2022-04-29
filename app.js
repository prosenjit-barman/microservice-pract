/* eslint-disable prettier/prettier */
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const GlobalErrorhandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
//require express
const app = express();

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} //Will only display the log in Development environment.

//Defining Middleware
app.use(express.json()); //express.json is middleware. It is a function that can modify incoming request data. It stands between middle of the request and response.

//Accesing the Static Files on other folder. Middleware defined, static fuction of express default Middleware
app.use(express.static('./public')); //Public folder is already set to root

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

//Mounting Router comes after defining all the variable
app.use('/api/v1/tours', tourRouter); //connecting new router to the application using Middleware,tourRouter(Mounting)
app.use('/api/v1/users', userRouter); //connecting new router to the application using Middleware,userRouter(Mounting)

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
