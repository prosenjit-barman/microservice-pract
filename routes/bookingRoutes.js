const express = require('express');
const bookingController = require("./../controllers/bookingController");
const authController = require("./../controllers/authController");
const router = express.Router();
//By default each router only has access to the params of their specific routes. In order to get access to other router, we need to use merge params

router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);

module.exports = router;