const express = require('express');
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");
const router = express.Router({ mergeParams: true });
//By default each router only has access to the params of their specific routes. In order to get access to other router, we need to use merge params

router.use(authController.protect);

router
.route('/')
.get(reviewController.getAllReviews)
.post(
    authController.restrictTo('user'), 
    reviewController.setTourUserIds, 
    reviewController.createReview
    );

    router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'),reviewController.deleteReview);

module.exports = router;