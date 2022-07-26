const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace( '<PASSWORD>', process.env.DATABASE_PASSWORD );

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  // eslint-disable-next-line no-console
  .then(() => console.log('DB connnection successful!'));

//Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')); //${__dirname} is the safest mathod to locate a file
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')); //${__dirname} is the safest mathod to locate a file
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')); //${__dirname} is the safest mathod to locate a file

//import Data into Database
const importData = async () => {
    try{
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
    console.log('Data Loaded Succesfully!');
    process.exit();
    } catch(err){
        console.log(err);
    }
};

//Delete All data from collections
const deleteData = async() => {
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data Deleted Succesfully!");
        process.exit();
    } catch(err){
        console.log(err);
    }
};

if(process.argv[2] === '--import'){
    importData();
} else if (process.argv[2] === '--delete'){
    deleteData();
}

console.log(process.argv);