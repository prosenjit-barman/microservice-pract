const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

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

//import Data into Database
const importData = async () => {
    try{
        await Tour.create(tours);
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