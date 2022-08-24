const express = require('express');
const bookingController = require("./../controllers/bookingController");
const authController = require("./../controllers/authController");
const router = express.Router();
//By default each router only has access to the params of their specific routes. In order to get access to other router, we need to use merge params
//router.use(authController.protect);

//router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/')
.get(bookingController.getallBooking)
.post(bookingController.createBooking);

router.route('/:id')
.get(bookingController.getBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking);

module.exports = router;