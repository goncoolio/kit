const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { error, success } = require('../config/helper');
const httpStatus = require('http-status');
const logger = require('../config/logger');
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
        attributes: [ 'id', 'uuid', 'nom', 'prenoms', 'role', 'email', 'tel', 'status', 'address', 'email_verified_at', 'tel_verified_at', 'verification_code' ]            
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



const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = String(req.body.refresh_token);
        
        if (!refreshToken) {
          return res.status(401).json(error(httpStatus.UNAUTHORIZED, 'Refresh token is required'));
        }

        // Vérifier si le token existe dans la base de données
        const storedToken = await Token.findOne({ 
            where: { token: refreshToken } 
        });

        if (!storedToken) {
          return res.status(401).json(error(httpStatus.UNAUTHORIZED, 'Invalid refresh token'));
        }

        // Vérifier si le token n'est pas expiré
        if (storedToken.expires < new Date()) {
            // await storedToken.update({ revoked: true });
          return res.status(401).json(error(httpStatus.UNAUTHORIZED, 'Refresh token has expired'));
        }

        // Ajouter les informations du token à la requête
        req.refresh_token = storedToken;
     
        next();
    } catch (e) {
        logger.error(e);
        res.status(500).json(error(httpStatus.INTERNAL_SERVER_ERROR, e.message));
    }
};

module.exports = { 
  protect,
  verifyRefreshToken
}