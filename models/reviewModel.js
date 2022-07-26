//Review / Rating / Created At / ref to User / ref to Tour
const mongoose = require('mongoose');
const Tour = require('./tourModel');
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

    //Unique Reviews Construction
    //Only one user can create a review per tour
    reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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
    });

    //static function to calculate average
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: `$tour`,
                nRating: { $sum: 1 },
                avgRating: { $avg: `$rating` }
        }
    }
    ]);

    if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
} else {
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
    });
}
};

reviewSchema.post('save', function(next) {
    //This points to current doc
    //Constructor is model who created the document
    this.constructor.calcAverageRatings(this.tour)
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne()
    next()
});

reviewSchema.post(/^findOneAnd/, async function() {
    //await this.findOne(); Does not work here as query is already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

//Parent Referencing will be used in this matter.

