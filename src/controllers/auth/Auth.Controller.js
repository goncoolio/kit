const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { error } = require('../../config/helper')
const asyncHandler = require('express-async-handler')
const { createUser, loginWithEmailPassword, logoutAuth, getUserByUuid, changePasswordService, confirmEmailService, sendResetPasswordCodeService, confirmPasswordCodeService, updateUserService, sendMobileResetPasswordCodeService } = require('../../services/authService')
const httpStatus = require('http-status');
const moment = require('moment');
const logger = require('../../config/logger')
const { generateToken, generateAuthTokens, verifyToken, destroyTokenById } = require('../../services/tokenService')
const { tokenTypes } = require('../../config/tokens')


const register = asyncHandler(async (req, res) => {

  try {
    const user = await createUser(req.body);
    const code = user.statusCode;
    let tokens = {};
    if (user.response.status) {
       const all_tokens = await generateAuthTokens(user.response.data);
       tokens = all_tokens.response.data
       
    }

    const { status, message, data } = user.response;
    res.status(user.statusCode).send({ status, code, message, data, tokens });

  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }

})


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginWithEmailPassword(email, password);
    
    const { message, data, status } = user.response;
    const code = user.statusCode;
    let tokens = {};
    if (user.response.status) {
      const all_tokens = await generateAuthTokens(data);
      tokens = all_tokens.response.data
    }
    res.status(user.statusCode).send({ status, code, message, data, tokens });

  } catch (e) {
    logger.error(e);
    res.status(httpStatus.BAD_GATEWAY).send(e);
  }

});



const getMe = asyncHandler(async (req, res) => {
 
  const user = req.user; 
  const { id, verification_code, ...safeUser } = req.user.toJSON();
  res.status(httpStatus.OK).send({ 
    status: httpStatus.OK, 
    message: 'OK', 
    user: safeUser 
  });
})



const logout = async (req, res) => {
  const msg = await logoutAuth(req, res);
  res.status(httpStatus.ACCEPTED).send(msg);
}



const refreshTokens = async (req, res) => {
  try {
      const tokenInDataBase = await verifyToken(
          req.refresh_token,
          tokenTypes.REFRESH,
      );

      if (tokenInDataBase?.statusCode === httpStatus.NOT_FOUND || tokenInDataBase?.statusCode === httpStatus.INTERNAL_SERVER_ERROR) {
        return res.status(httpStatus.NOT_FOUND).send(tokenInDataBase);
      }
      
      
      const user = await getUserByUuid(tokenInDataBase.user_uuid);
      if (user?.statusCode === httpStatus.NOT_FOUND) {
        return res.status(httpStatus.NOT_FOUND).send(user);
      }

      await destroyTokenById({id: tokenInDataBase.id});
      const tokens = await generateAuthTokens(user);
      res.send(tokens);
      
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.NOT_FOUND).send(e);
  }
};

const changePassword = async (req, res) => {
  try {
      const responseData = await changePasswordService(req.body, req.body.uuid);
      res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
};

const confirmEmail = async(req, res) => {
  try {
    const user = req.user;
    const responseData = await confirmEmailService(req.body, user);
    res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
}


const confirmTel = async(req, res) => {
  try {
    const user = req.user;
    const responseData = await confirmTelService(req.body, user);
    res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
}


const sendResetPasswordCode = async(req, res) => {
  try {
    const responseData = await sendResetPasswordCodeService(req.body.email);
    res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
}

const sendMobileResetPasswordCode = async(req, res) => {
  try {
    const responseData = await sendMobileResetPasswordCodeService(req.body.tel);
    res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
}


const confirmPasswordCode = async(req, res) => {
  try {
    const responseData = await confirmPasswordCodeService(req.body);
    res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
}


const updateProfil = asyncHandler(async (req, res) => {

  try {
    const user = req.user;
    const responseData = await updateUserService(req.body, user);
    res.status(responseData.statusCode).send(responseData);
  } catch (e) {
      logger.error(e);
      res.status(httpStatus.BAD_GATEWAY).send(e);
  }
})

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshTokens,
  changePassword,
  confirmEmail,
  confirmTel,
  sendResetPasswordCode,
  sendMobileResetPasswordCode,
  confirmPasswordCode,
  updateProfil,

}