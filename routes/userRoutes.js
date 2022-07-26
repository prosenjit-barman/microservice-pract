const express = require('express');
const multer = require('multer');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
//Password restrictTo
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Authcontroller.protect middleware is used before all routes that requires login.
router.use(authController.protect);

router.patch('/updateMyPassword', 
authController.updatePassword
);

router.get('/me', 
userController.getMe, 
userController.getUser);

router.patch('/updateMe', 
userController.uploadUserPhoto, 
userController.resizeUserPhoto, 
userController.updateMe); //single means we only want to upload a single image. Inside the single, the name of the upload field which we are going to use to upload an image.


router.delete('/deleteMe', 
userController.deleteMe
);
 
router.use(authController.restrictTo('admin'));
//User Routes
router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = router;