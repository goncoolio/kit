const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { error } = require('../../config/helper')
const asyncHandler = require('express-async-handler')
const { createUser, loginWithEmailPassword, logoutAuth, getUserByUuid, changePasswordService } = require('../../services/authService')
const httpStatus = require('http-status');
const moment = require('moment');
const logger = require('../../config/logger')
const { generateToken, generateAuthTokens, verifyToken, destroyTokenById } = require('../../services/tokenService')
const { tokenTypes } = require('../../config/tokens')
const User = require('../../models').User
const Token = require('../../models').Token;

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const register = asyncHandler(async (req, res) => {

  try {
    const user = await createUser(req.body);
    let tokens = {};
    if (user.response.status) {
       tokens = await generateAuthTokens(user.response.data);
    }

    const { status, message, data } = user.response;
    res.status(user.statusCode).send({ status, message, data, tokens });

  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }

})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginWithEmailPassword(email, password);
    
    const { message } = user.response;
    const { data } = user.response;
    const { status } = user.response;
    const code = user.statusCode;
    let tokens = {};
    if (user.response.status) {
      tokens = await generateAuthTokens(data);
    }
    res.status(user.statusCode).send({ status, code, message, data, tokens });

  } catch (e) {
    logger.error(e);
    res.status(httpStatus.BAD_GATEWAY).send(e);
  }

});



const getMe = asyncHandler(async (req, res) => {
 
  const status = httpStatus.OK;
  const message = "OK";
  const user = req.user;

  res.status(httpStatus.OK).send({ status, message, user });
})



const logout = async (req, res) => {
  await logoutAuth(req, res);
  res.status(httpStatus.NO_CONTENT).send();
}


const refreshTokens = async (req, res) => {
  try {
      const tokenInDataBase = await verifyToken(
          req.headers.refresh_token,
          tokenTypes.REFRESH,
      );
      const user = await getUserByUuid(tokenInDataBase.user_uuid);
      if (user == null) {
          res.status(httpStatus.BAD_GATEWAY).send('User Not Found!');
      }
      console.log(user);

      await destroyTokenById({id: tokenInDataBase.id});
      const tokens = await generateAuthTokens(user);
      res.send(tokens);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
};

const changePassword = async (req, res) => {
  try {
      const responseData = await changePasswordService(req.body, req.uuid);
      res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshTokens,
  changePassword,
}