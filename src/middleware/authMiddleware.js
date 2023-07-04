const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { error } = require('../config/helper')
const User = require('../models').User

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

    //   Get user from the token
      req.user = await User.findOne({
          where: {id: decoded.id},
          attributes: ['nom', 'prenoms', 'email', 'tel']            
      })
        

      next()
    } catch (errors) {
        res.status(401).json(error('403', errors.message))        
    }
  }

  if (!token) {
    res.status(401).json(error('No token'))
    // throw new Error('No token')
  }
})

module.exports = { protect }