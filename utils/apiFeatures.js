//creating a reusable model that we can use with other controllers
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    } //this is the function that gets called automatically if we create an object out of this class

    //FILTERING
    filter() {
        //Filtering
        const queryObj = {...this.queryString};//... is destructuring. all the fields out of the object. Since withing the curly braces, a new object will be created
        const excludedFields = ['page', 'sort', 'limit', 'fields']; //excluding field from query string
        excludedFields.forEach((el) => delete queryObj[el]);        //a loop to search for the excluded fields

        //console.log(req.query, queryObj); //formatted data from query string will be displayed
        //Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);//replacing mongodb operator with a $ sign ahead. Used regular expression here
        //console.log(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));
        //let query = Tour.find(JSON.parse(queryStr)); //Finding all documents/collections from the database using mongoose. Find method will return an array. Filter object

        return this;
    }

    //Sorting
    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
            //sort('price ratingsAverage'); sorting by multiple condition
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    //LIMITING
    limitFields() {
        //FIELD LIMITING
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');//splitting the query parameters by comma and then jpoining them
            this.query = this.query.select(fields);//in response, this will return the fields that are specificed in parameter
            //console.log(fields)
        } else {
            this.query = this.query.select('-__v');//in response, this field will be excluded
        }

        return this;
    }

    //PAGINATION
    paginate() {
        const page = parseInt(this.queryString.page) || 1; //getting the page from query string. multiplying by one is converting string to a number
        const limit = parseInt(this.queryString.limit) || 100; //limiting the result
        const skip = (page - 1); //if we are requesting page 3, then the result will be start from 21. This formula will skip result based on the limit and previous page result 
        const skipPage = skip * limit;
        this.query = this.query.skip(skipPage).limit(limit); //the amount of result should be skipped before querying and limiting the data display

        // if(req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error("This page doesn't exist");
        // }

        return this;
    }
}

module.exports = APIFeatures;