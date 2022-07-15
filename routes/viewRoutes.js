const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');


const router = express.Router();

// Routes
// router.get('/', (req, res) => {
//     res.status(200).render('base', {
//       tour: 'The Forest Hiker',
//       user: 'Prosenjit'
//     }) //pass data into template. Need to define a object and some data there. The Data or object defined here are called as locals in pug file 
//   }); //specifying pug template. It will go directly to the views folder and check for the file and then ender the file.
  
  //Route for all pages
  router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
  router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

  // Login
  router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
  router.get('/me', authController.protect, viewsController.getAccount);
  router.get('/my-tours', authController.protect, viewsController.getMyTours);

  // router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;