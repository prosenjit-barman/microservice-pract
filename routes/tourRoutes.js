/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

//Router for each resources- Tour
const router = express.Router();

//Param Middleware
//Need to include a value parameter also with the Param Middleware. Here declared as val
//router.param('id', tourController.checkID);//Param Middleware function

//As soon as someone hits the route, the aliastTopTours middleware will run first.
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)//when defining middleware or handler along, need to separate them by comma

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
//If need to change the version or resource name if need to change anything
router
.route('/')
.get(authController.protect, tourController.getAllTours)
.post(/*tourController.checkBody, */tourController.createTour);

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), //Roles allowed to interact with resources
    tourController.deleteTour
    ); //if a user already logged in authcontroller.protect

module.exports = router;