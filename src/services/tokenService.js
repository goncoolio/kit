const moment = require("moment");
const { tokenEnv, tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const { error } = require("../config/helper");
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
    const payload = jwt.verify(token, tokenEnv.JWT_SECRET, (err, decoded) => {
        if (err) {
            error(httpStatus.BAD_REQUEST, 'Token not found', err.message);
        } else {
            // if everything is good, save to request for use in other routes
            return decoded;
        }
    });

    const tokenInDataBase = await Token.findOne({
        token,
        type,
        user_uuid: payload.uuid,
        blacklisted: false,
    });
    if (!tokenInDataBase) {
        error(httpStatus.BAD_REQUEST, 'Token not found !');
    }
    return tokenInDataBase;
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
    const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
    const accessToken = generateToken(
        user.uuid,
        accessTokenExpires,
        tokenTypes.ACCESS,
    );
    const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_DAYS, 'days');
    const refreshToken = generateToken(
        user.uuid,
        refreshTokenExpires,
        tokenTypes.REFRESH,
    );
    const authTokens = [];
    authTokens.push({
        token: accessToken,
        user_uuid: user.uuid,
        expires: accessTokenExpires.toDate(),
        type: tokenTypes.ACCESS,
        blacklisted: false,
    });
    authTokens.push({
        token: refreshToken,
        user_uuid: user.uuid,
        expires: refreshTokenExpires.toDate(),
        type: tokenTypes.REFRESH,
        blacklisted: false,
    });

    await saveMultipleTokens(authTokens);

    const expiredAccessTokenWhere = {
        expires: {
            [Op.lt]: moment(),
        },
        type: tokenTypes.ACCESS,
    };
    await destroyTokenById(expiredAccessTokenWhere);
    const expiredRefreshTokenWhere = {
        expires: {
            [Op.lt]: moment(),
        },
        type: tokenTypes.REFRESH,
    };
    await destroyTokenById(expiredRefreshTokenWhere);
    const tokens = {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };

    return tokens;
};


module.exports = {
    generateToken,
    verifyToken,
    saveToken,
    destroyTokenById,
    generateAuthTokens,
}