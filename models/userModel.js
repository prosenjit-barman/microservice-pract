const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//User Schema
//name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Tell Us Your Name']
    },
    email: {
        type: String,
        required: [true, 'Please Tell Us Your Email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a Valid Email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'], //enum validator to specify certain roles
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please Provide a Password'],
        minlength: 8,
        select: false //password will never be appear on the user end.
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please Confirm Your Password'],
        validate: {
            validator: function(el) {
                //This only Works onCreate and SAVE!!!
                return el === this.password;
            },//validating password with previous one
            message: 'Password Are not Matching!'
        }
    },
  passwordChangedAt: {
      type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
      type: Boolean,
      default: true,
      select: false
  }
  
});

//Encrypting Password
//best away to do so is using mongoose middleware. going to use preSave middleware

userSchema.pre('save', async function(next) {
    //Only Run this function is password was actually modified
    if(!this.isModified('password')) return next();

    //Bcrypting Passwords with has by cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    //deleting the password confirm field
    this.passwordConfirm = undefined; //deleting a field by setting undefined. password confirm is just for validations. After the validation succesfull, we don't need the password confirm
    next();
});

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//Query middleware for not showing the deactivated users in result
userSchema.pre(/^find/, function(next) {
    //THIS POINTS TO THE CURRENT QUERY
    this.find({active: { $ne : false } });
    next();
}); //this middleware function will be applied to the query starts with find. /^find/ is a regular expression that will look for find

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);//compare function will compare candidate password and user password and return true or false
};//this function will return true or false. If true, password is correct, if false, password is not correct

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000, 
            10
        );//the millisecond result parsing to integer. Base is 10 

      //console.log(changedTimestamp, JWTTimestamp);
      return JWTTimestamp < changedTimestamp;

    }
    
    // False means NOT changed
    return false;
  };

  //Reset Token Generation
  //will be generated using the crypto library
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex'); //randombytes is a method of crypto. then converting that bytes to hexadecimal.
    
    this.passwordResetToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex'); //Encrypting the password reset token and saving it to the database.

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //Reset token expiration date. 10 minutes here. Needs to be defined with millisecond.

    return resetToken; //unencrypted reset token will be send to the email.
};

const User = mongoose.model('User', userSchema);
module.exports = User;
