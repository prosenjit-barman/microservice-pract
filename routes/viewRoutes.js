const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');


const router = express.Router();

router.use(authController.isLoggedIn)

// Routes
// router.get('/', (req, res) => {
//     res.status(200).render('base', {
//       tour: 'The Forest Hiker',
//       user: 'Prosenjit'
//     }) //pass data into template. Need to define a object and some data there. The Data or object defined here are called as locals in pug file 
//   }); //specifying pug template. It will go directly to the views folder and check for the file and then ender the file.
  
  //Route for all pages
  router.get('/', viewsController.getOverview);
  router.get('/tour/:slug', viewsController.getTour);

  // Login
  router.get('/login', viewsController.getLoginForm);

module.exports = router;