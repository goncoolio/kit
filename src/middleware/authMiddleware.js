const asyncHandler = require('express-async-handler')
const { error } = require('../config/helper');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const { tokenTypes } = require('../config/tokens');
const { verifyToken } = require('../services/tokenService');
const User = require('../models').User;
const Token = require('../models').Token;

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json(error(httpStatus.UNAUTHORIZED, 'No token'))
  }

  // Get token from header
  const token = authorization.split(' ')[1];

  try {
    // Verify token : signature + type, un refresh token ne doit pas ouvrir de session
    const decoded = await verifyToken(token, tokenTypes.ACCESS)

    // Si le token n'existe plus (logout) ou est blacklisté, il ne doit plus être accepté
    const tokenExist = await Token.findOne({
      where: {
        token: token,
        type: tokenTypes.ACCESS,
        blacklisted: false,
      }
    })

    if (!tokenExist) {
      return res.status(httpStatus.UNAUTHORIZED).json(error(httpStatus.UNAUTHORIZED, 'Token invalide'))
    }

    const user = await User.findOne({
        where: {uuid: decoded.uuid},
      attributes: [ 'id', 'uuid', 'nom', 'prenoms', 'role', 'email', 'tel', 'status', 'address', 'email_verified_at', 'tel_verified_at', 'verification_code', 'verification_code_expires_at' ]
    })

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json(error(httpStatus.UNAUTHORIZED, 'User not found'))
    }

    req.user = user
  } catch (errors) {
      return res.status(httpStatus.UNAUTHORIZED).json(error(httpStatus.UNAUTHORIZED, errors.message))
  }

  // next() est appelé hors du try : une erreur levée par la suite de la chaîne
  // ne doit pas déclencher une seconde réponse ici
  next()
})



const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body.refresh_token;

        if (!refreshToken || typeof refreshToken !== 'string') {
          return res.status(401).json(error(httpStatus.UNAUTHORIZED, 'Refresh token is required'));
        }

        // Vérifier si le token existe dans la base de données
        const storedToken = await Token.findOne({
            where: {
                token: refreshToken,
                type: tokenTypes.REFRESH,
                blacklisted: false,
            }
        });

        if (!storedToken) {
          return res.status(401).json(error(httpStatus.UNAUTHORIZED, 'Invalid refresh token'));
        }

        // Vérifier si le token n'est pas expiré
        if (storedToken.expires < new Date()) {
            await storedToken.destroy();
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
