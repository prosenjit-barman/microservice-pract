const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    }); //The id of theuser is parse as payload. Then need to include the secret. Better to include that on the configuration file
};

//Function for sending JWT token
const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
   
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), //millisecond
        httpOnly: true,
        secure: req.secure || req.headers('x-forwarded-proto') === 'https'
    });

    //Remove the password from the output
    user.password = undefined;
    
    res.status(statusCode).json({
        status: 'Success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    //const newUser = await User.create(req.body); //Security flaw here beacuse the data is coming from the body

    //To Prevent Security Flaws
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
        passwordChangedAt: req.body.passwordChangedAt
    });
    const url = `${req.protocol}://${req.hostname}/me`;
    await new Email(newUser, url).sendWelcome();

    //log the user in as soon as complet the signup
    createSendToken(newUser, 201, req, res);
    //const token = signToken(newUser._id);
    
    // res.status(201).json({
    //     status: 'Success',
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // }); //since it is a async function, we need to do error handling
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body; //destructure can also be done by keeping the variable name within second bracket if the property and variable name are same

    //1) If email and passwords exist
    if(!email || !password) {
        return next(new AppError('Please Provide a Valid Email And Password!', 400)); //return is because after calling the next function, we need to close the login function
    }

    //2) check if the user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email or Password', 401));
    }

    //3) If everything is okay, send the token to the client
    createSendToken(user, 200, req, res);

    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'Success',
    //     token
    // });
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'Success'
    });
};


exports.protect = catchAsync(async (req, res, next) => {
    //1) Getting Token and check if it's there
    let token;

    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    else if (req.cookies.jwt){
        token = req.cookies.jwt;
    } //if there are no token in Authorization header, then Cookies will be used.
    
    //console.log(token);

    if(!token) {
        return next(
            new AppError('You are Not Logged in! Please Log in to get access.', 401)
            );
    }
    //2) Verification Token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //decoded payload to JSON web token

    //3) Check if the User still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The token belonging to this user no longer exist.', 401));
    }

    //4) Check if user changed password after the JWT token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User Recently Have Changed the Password. Please Login Again!', 401));
    } //iat, initially created at
    
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser; //all the data of the user in request
    res.locals.user = currentUser
    next(); //This next will send the user to protected route if all the above criterias are fulfilled.
});


//Only For Rendered Page. No Errors.
exports.isLoggedIn = async (req, res, next) => {    
    if (req.cookies.jwt){
        try{

    //2) Verification Token
    const decoded = await promisify(jwt.verify)(
        req.cookies.jwt, 
        process.env.JWT_SECRET
        ); //decoded payload to JSON web token

    //3) Check if the User still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next();
    }

    //4) Check if user changed password after the JWT token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
    } //iat, initially created at
    
    //GRANT ACCESS TO PROTECTED ROUTE
    res.locals.user = currentUser;
    return next();
} catch(err) {
    return next()
}
}
    next(); //This next will send the user to protected route if all the above criterias are fulfilled.

};



exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //Roles is an array. roles['admin', 'lead-guide']
        //when a user get access to a certain route, that user role will be inside of the roles array.

        if(!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
                );
        }

        next();
    };
};

//Password reset
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) get User Based on Posted Email
    const user = await User.findOne({
        email: req.body.email
    });

    if( !user ){
        return next(new AppError('There is no user with this email address.', 404));
    }
    
    // 2) Generate the Random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to the user's email
    try {
        // await sendEmail({
            //     email: user.email,
            //     subject: 'Your Password reset Token. (Valid For 10 minutes)',
            //     message
            // });
            
            const resetURL = `${req.protocol}://${req.get(
                'host'
                )}/api/v1/users/resetPassword/${resetToken}`
            await new Email(user, resetURL).sendPasswordReset();

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email'
            }); //Token will not be sent as response.
        } catch(err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new AppError('There was an error sending the Email. Try Again Later!'), 500);
        }//A try catch block is defined in case user made an error. in case of error, the password will not be reseted. that is whay, undefined added there.
});
exports.resetPassword = catchAsync (async (req, res, next) => {
    // 1) Get user Based on the Token. Encrypt the token and comparing it with the encrypted on stored in the database
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpires: {$gt: Date.now() }
}); //First of all, we are encrypting the Reset token and then matching it with the Token stored inside the database for a specific user. Then based on that, we are doing the comparison. In the same way, we are also validating if the token is expired or not using the mongodb $gt method
    
    // 2) Will set a new password if the token is not expired and there is a user
    if (!user) {
        return next(new AppError('Token is Invalid or has expired', 400))
    } //if the Token is invalid or token is expired.

    //If the Token is valid, then the following operation will be performed
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); //after the password is resetted, will save inside the DB

    // 3) Update changedPasswordAt property for the user

    // 4) Sending the JWT and loggin in the user
    createSendToken(user, 200, req, res);

    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'Success',
    //     token
    // });
});

//Resetting Password Without Forget Password
//Current password is required to update password
exports.updatePassword = catchAsync( async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if Posted Current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('The Entered Password is Wrong!', 401));
    }
    // 3) If so, update Password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);

});