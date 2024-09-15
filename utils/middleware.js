const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  }else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  console.log('Headers:', request.headers)
  const authorization = request.get('Authorization'); 
  console.log('Authorization Header:', authorization);

  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', ''); 
  } else {
    request.token = null; 
  }
  console.log('Extracted Token:', request.token);

  next(); 
};

const userExtractor =async (request, response, next) => {
  const token = request.token;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET);

      if (decodedToken && decodedToken.id) {
        // Find the user by the ID from the token
        const user = await User.findById(decodedToken.id);

        if (user) {
          request.user = user; // Attach the user to the request object
          next(); // Proceed to the next middleware or route handler
        } else {
          response.status(404).json({ error: 'User not found' });
        }
      } else {
        response.status(401).json({ error: 'Token does not contain a valid user ID' });
      }
    } catch (error) {
      console.error('Token verification failed:', error); // Log the error for debugging
      response.status(401).json({ error: 'Token is invalid' });
    }
  } else {
    response.status(401).json({ error: 'Token is missing' });
  }
};


module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}