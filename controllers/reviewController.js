const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {

    //Allow Nested Route. For GET
    let filter = {}
    if(req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'Success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {


    //Allow Nested Route. For Post
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id

    const newReview = await Review.create(req.body);
    res.status(201).json({
        status: 'Success',
        data: {
            review: newReview
        }
    });

});

exports.deleteReview = factory.deleteOne(Review);