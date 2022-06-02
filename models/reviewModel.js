//Review / Rating / Created At / ref to User / ref to Tour
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            require: [true, 'Review Can not be Empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review Must Belong to a Tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review Must belong to a User']
        }

    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

    reviewSchema.pre(/^find/, function(next) {
        // this.populate({
        //     path: 'tour',
        //     select: 'name'
        // }).populate({
        //     path: 'user',
        //     select: 'name photo'
        // })

        this.populate({
            path: 'user',
            select: 'name photo'
        })

        next();
    })
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

//Parent Referencing will be used in this matter.

