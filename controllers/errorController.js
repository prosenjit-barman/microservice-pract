const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleduplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/);
  console.log(value);

  const message = `Duplicate Field Value: ${value}, Please use another value!`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid Token. Please Log in Again', 401);
const handleJWTExpiredError = () => new AppError('Expired Token. Please Login Again to Regain Access!', 401);

const sendErrorDev = (err, req, res) => {
  //API
  //It will send Error Message if requested via API
  if(req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
}

// RENDERED WEBSITE
//Error message for the site
  console.error('ERROR!', err);

  return res.status(err.statusCode).render('error', {
    title: "Something Went Wrong!",
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  //API

  if (req.originalUrl.startsWith('/api')) {
  //Operation error. Trusted. Can be sent to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR!', err);
    //2) Send Error Message
    return res.status(500).json({
      status: 'Error',
      message: 'Something Went Wrong'
    });

} 
  //RENDERED WEBSITE
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
      title: "Something Went Wrong!",
      msg: err.message
    });
  }

    console.error('ERROR!', err);

    //2) Send Error Message
    return res.status(err.statusCode).render('error', {
      title: "Something Went Wrong!",
      msg: 'Please Try Again Later.'
    });
}


module.exports = (err, req, res, next) => {
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;//default internal server error message code defined
    err.status = err.status || 'error';
  
  //Error Based On Environment

  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if(process.env.NODE_ENV === 'production'){
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleduplicateFieldsDB(error);
    if(err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if(err.name === 'JsonWebTokenError') error = handleJWTError();
    if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, req, res);
  }
};