/* eslint-disable prettier/prettier */
//Require Mongoose package for connection
// eslint-disable-next-line prettier/prettier
const mongoose = require('mongoose');
/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
//Handling the Uncaught Exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting Down...');
  console.log(err.name, err.message);
  process.exit(1);//dont require sever for uncaught exceptions. Inhandled Rjection will handle system related fails

  //The General Way of Shutting down an application is shutting fdown the server first and then application. Below Included
  // server.close(() => {
  //   process.exit(1);
  // });//giving time to execute the background process then stopping the server

});
dotenv.config({
  path: './config.env',
});

const app = require('./app');

//Env
//console.log(process.env);
//env is global variable to defined the environment
//Starting up a server

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
//connecting mongoose
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => console.log('DB connection Succesfull'));//.connect() is promise

//Interating with database through model and using documents
/* const testTour = new Tour({
  name: 'Thee Park Camper',
  price: 997
});

testTour.save().then(doc => {
  console.log(doc);
}).catch(err => {
  console.log('Error:', err);
});*/

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

//Handling Unhandling Rejection using the Event. If any point an unhandled rejection happens, the process object will emit an unhandled rejection, We can subscribe to that even
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting Down...');
  console.log(err);
  //The General Way of Shutting down an application is shutting fdown the server first and then application. Below Included
  server.close(() => {
    process.exit(1);
  });//giving time to execute the background process then stopping the server

});
