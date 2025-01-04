const moment = require("moment");
const { tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const { error, success } = require("../config/helper");
const httpStatus = require("http-status");
const { Op } = require("sequelize");
const Token = require('../models').Token;




const generateToken = (uuid, expires, type, secret = process.env.JWT_SECRET) => {
    const payload = {
        uuid: uuid,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};


const verifyToken = async (token, type) => {
    try {
        // Add validation for token
        if (!token || typeof token !== 'string') {
            return error(httpStatus.BAD_REQUEST, 'Invalid token format');
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Validate payload has required fields
        if (!payload.user_uuid) {
            return error(httpStatus.BAD_REQUEST, 'Invalid token payload');
        }
        return payload;
        
    } catch (err) {
        return error(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR, err.message);
    }
};


const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    return Token.create({
        token,
        user_id: userId,
        expires: expires.toDate(),
        type,
        blacklisted,
    });
};

const saveMultipleTokens = async (tokens) => {
    return Token.bulkCreate(tokens);
};


const destroyTokenById = async (conditions) => {
    return Token.destroy({ where: conditions });
};


const generateAuthTokens = async (user) => {
    try {
        // Generate tokens
        const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
        const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_DAYS, 'days');
        
        const accessToken = generateToken(user.uuid, accessTokenExpires, tokenTypes.ACCESS);
        const refreshToken = generateToken(user.uuid, refreshTokenExpires, tokenTypes.REFRESH);

        // Prepare tokens for database
        const authTokens = [
            {
                token: accessToken,
                user_uuid: user.uuid,
                expires: accessTokenExpires.toDate(),
                type: tokenTypes.ACCESS,
                blacklisted: false,
            },
            {
                token: refreshToken,
                user_uuid: user.uuid,
                expires: refreshTokenExpires.toDate(),
                type: tokenTypes.REFRESH,
                blacklisted: false,
            }
        ];

        // Database operations
        await Promise.all([
            saveMultipleTokens(authTokens),
            destroyTokenById({
                expires: { [Op.lt]: moment() },
                type: { [Op.in]: [tokenTypes.ACCESS, tokenTypes.REFRESH] }
            })
        ]);

        return success(httpStatus.CREATED, 'OK', {
            access: { token: accessToken, expires: accessTokenExpires.toDate() },
            refresh: { token: refreshToken, expires: refreshTokenExpires.toDate() }
        });
    } catch (e) {
        logger.error(e);
        return error(httpStatus.INTERNAL_SERVER_ERROR, e.message);
    }
}


module.exports = {
    generateToken,
    verifyToken,
    saveToken,
    destroyTokenById,
    generateAuthTokens,
}