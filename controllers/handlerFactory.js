//This handler Factory will always return a Function or Controller.
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//This Handler to Perform Deletion
exports.deleteOne = Model => catchAsync(async (req,res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    
    if(!doc) {
      return next(new AppError('No document Found with that ID', 404));
    }

    res.status(204).json({
        status: "Success",
        data: null
    });
});
