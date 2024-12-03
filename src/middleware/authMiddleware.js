const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { error, success } = require('../config/helper');
const httpStatus = require('http-status');
const User = require('../models').User;
const Token = require('../models').Token;

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Si le token existe plus meme s'il est valide je dois le supprimé normalement 
      const tokenExist = await Token.findOne({
        where: {token: token}
      })
      if (!tokenExist) {
        res.status(401).json(error(httpStatus.UNAUTHORIZED, 'Token invalide'))
        return
      }

      req.user = await User.findOne({
          where: {uuid: decoded.uuid},
          attributes: ['id', 'uuid', 'nom', 'prenoms', 'role', 'email', 'tel', 'status' ]            
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