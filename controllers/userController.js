const User = require('./../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//Multer storage and destination config
// const multerStorage = multer.diskStorage({
//     //Setting up the destination. Where the file is going to be saved
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         //user-userdID-timestamp.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     } //going to create a unique filename
// });

const multerStorage = multer.memoryStorage(); //The image will be stored in a buffer in this way. n

//Multer Filter
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an Image. Please upload only images', 400), false);
    }
} //this function will check if the uploaded file is an image. non image type files will not be uploaded

// All About Multer
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90})
    .toFile(`public/img/users/${req.file.filename}`); //it will create an object so that we can chain multiple option to process the image

    next();
};

//Filtering the Objects that can user pass through Body.

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el))
        newObj[el] = obj[el];
    }) //Looping through objects based on key names. If the current fields are one of the allowed fields, then new object of the current field will be equal to the current field name. 
    return newObj;
};

//Controller for viewing profile
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

//Updating the User Data
exports.updateMe = catchAsync( async (req, res, next) => {

    // console.log(req.file);
    // console.log(req.body);
    //1) Create Error if the user POSTs password Data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This Route is not for password updates. Please use /updateMyPassword.', 
                400
            )
        );
      }
    //2) Filtered out unwanted field named that are not allowed to be updated
      const filteredBody = filterObj(req.body, 'name', 'email');
      if (req.file) filteredBody.photo = req.file.filename;
      
      //3) Update User Document
      const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    
    //Options that will require while updating. X is 
//Putting x because we don't want to update everything in the Body. If the user puts role in the Body and set it to Admin, He easily can get the Admin access.
//The Object we are going to pass instead of X will only contain the Name and email.

    res.status(200).json({
        status: 'Success',
        data : {
            user: updatedUser
        }
    });
}
);

//Deleting an User
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

//Route Handler for USERS- Display All Users
exports.getAllUsers = factory.getAll(User);

//Route Handler for USERS- disply user by id
//Handler Factory is handling everything
exports.getUser = factory.getOne(User);

//Route Handler for USERS- Create User

exports.createUser = (req, res) =>{
    res.status(500).json({
        Status: "Error",
        Message: "This Route is not yet defined. User /Signup instead"
    });
};

//Do not Update password with this
//Route Handler for USERS- to update user
exports.updateUser = factory.updateOne(User); //Handled By the Facory Handler

//Route Handler for USERS- to delete a user
exports.deleteUser = factory.deleteOne(User); //Handled By the Factory Handler