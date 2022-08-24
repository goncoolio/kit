const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
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

    //   const text = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      console.log(decoded)
    //   Get user from the token
        req.user = await User.findOne({
            where: {id: decoded.id},
            attributes: ['nom', 'prenoms', 'email', 'tel']            
        })
        

      next()
    } catch (error) {
        console.log(error)
        res.status(401)
        throw new Error('Not authorized token invalid')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

module.exports = { protect }