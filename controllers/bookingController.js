const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // Get Currently Booked Tour
    const tour = await Tour.findById(req.params.tourId);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        /* Information about the Session Started */
        //Only Card Method are allowed
        payment_method_types: ['card'],
        // After succesful payment route
        success_url: `${req.protocol}://${req.get('host')}/`,
        // After Cancelling the Payment
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        // Customer Email to provide personalized experience and to store the payment
        customer_email: req.user.email,
        // A reference ID is used to specify which tour has been purchased by the user
        client_reference_id: req.params.tourId,
        // Line Items shows everything about the product
        /* Session Information Ends */
        /* Product Information Started */
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [tour.imageCover],
            //multiplying due to showing cents
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1

        }]
        /* Product Information Ends */
    });

    // create session as response 
    res.status(200).json({
        status: 'success',
        session
    })
});