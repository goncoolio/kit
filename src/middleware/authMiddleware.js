const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { error, success } = require('../config/helper');
const httpStatus = require('http-status');
const User = require('../models').User;
const Token = require('../models').Token;

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    // req.headers.authorization &&
    // req.headers.authorization.startsWith('Bearer')
    req.headers.access_token &&
    req.headers.refresh_token
  ) {
    try {
      // Get token from header
      token = req.headers.access_token;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findOne({
          where: {uuid: decoded.uuid},
          attributes: ['nom', 'prenoms', 'email', 'tel', 'uuid']            
      })

      next()
    } catch (errors) {
        res.status(401).json(error(httpStatus.UNAUTHORIZED, errors.message))        
    }
  }

  if (!token) {
    res.status(401).json(error(httpStatus.UNAUTHORIZED, 'No token'))
    // throw new Error('No token')
  }
})

module.exports = { protect }