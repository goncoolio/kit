const User = require("../models").User;
const Token = require('../models').Token;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const { error, success } = require("../config/helper");
const { userConstant } = require("../config/constant");
const logger = require("../config/logger");
const { tokenTypes } = require("../config/tokens");


const createUser = async (userBody) => {
    try {
        const message = 'Successfully Registered the account! Please Verify your email.';
        if (await isEmailExists(userBody.email)) {
            return error(httpStatus.BAD_REQUEST, 'Email already taken');
        }
        const uuid = uuidv4();
        userBody.email = userBody.email.toLowerCase();
        userBody.uuid = uuid;
        userBody.status = userConstant.STATUS_ACTIVE;
        userBody.email_verified_at = userConstant.EMAIL_VERIFIED_FALSE;

        const user = await createNewUser(userBody);

        if (!user) {
            message = 'Registration Failed! Please Try again.';
            return error(httpStatus.BAD_REQUEST, message);
        }

        return success(httpStatus.CREATED, message, user);
    } catch (e) {
        logger.error(e);
        return error(httpStatus.BAD_REQUEST, 'Something went wrong!');
    }
};

const isEmailExists = async (email) => {
    return User.count({ where: { email } }).then((count) => {
        if (count != 0) {
            return true;
        }
        return false;
    });
}

const createNewUser = async (userBody) => {

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(userBody.password, salt)
    // Create user
    const user = await User.create({
        nom:                userBody.nom,
        prenoms:            userBody.prenoms,
        email:              userBody.email,
        tel:                userBody.tel,
        password:           hashedPassword,
        uuid:               userBody.uuid,
        status:             userBody.status,
        email_verified_at:  userBody.email_verified_at,

    });

    return {
        uuid:               user.uuid,
        nom:                user.nom,
        prenoms:            user.prenoms,
        email:              user.email,
        tel:                user.tel,
        // password:           hashedPassword,
        status:             user.status,
        email_verified_at:  user.email_verified_at,
    };
}


const loginWithEmailPassword = async (email, password) => {
    try {
        const message = 'Login Successful';
        const statusCode = httpStatus.OK;
        let user = await User.findOne({ where:  { email: email.toLowerCase() } });

        if (user == null) {
            return error(
                httpStatus.BAD_REQUEST,
                'You are not registered!',                
            );
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (user && isPasswordValid) {
            user = user.toJSON();
            delete user.id;
            delete user.password;
            return success(statusCode, message, user);
        }
        else {
            return error(httpStatus.BAD_REQUEST, 'Wrong Email or Password!');
        }
        
    } catch (e) {
        logger.error(e);
        return error(httpStatus.BAD_GATEWAY, 'Something Went Wrong!!');
    }
}

const logoutAuth = async (req, res) => {
    const refreshTokenDoc = await Token.findOne({
        token: req.headers.refresh_token, 
        type: tokenTypes.REFRESH,
        blacklisted: false,
    });
    if (!refreshTokenDoc) {
        res.status(httpStatus.NOT_FOUND).send({ message: 'User Not found!' });
    }

    await Token.destroy({where: {
        token: req.headers.refresh_token,
        type: tokenTypes.REFRESH,
        blacklisted: false,
    }});
    await Token.destroy({ where: {
        token: req.headers.access_token,
        type: tokenTypes.ACCESS,
        blacklisted: false,
    }});
}

const getUserByUuid = async (uuid) => {
    return User.findOneByWhere({ uuid });
};
const updateUserWhere = async (data, where) => {
    return User.update(data, { where })
        .then((result) => {
            return result;
        })
        .catch((e) => {
            logger.error(e);
            console.log(e);
        });
}

const changePassword = async (data, uuid) => {
    const  message = 'Login Successful';
    const statusCode = httpStatus.OK;
    let user = await getUserByUuid(uuid);

    if (!user) {
        return error(httpStatus.NOT_FOUND, 'User Not found!');
    }

    if (data.password !== data.confirm_password) {
        return error(
            httpStatus.BAD_REQUEST,
            'Confirm password not matched',
        );
    }

    const isPasswordValid = await bcrypt.compare(data.old_password, user.password);
    user = user.toJSON();
    delete user.password;
    delete user.id;

    if (!isPasswordValid) {
        statusCode = httpStatus.BAD_REQUEST;
        message = 'Wrong old Password!';
        return error(statusCode, message);
    }

    // Salt & hashedPassword
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(userBody.password, salt)

    const updateUser = await updateUserWhere(
        { password: hashedPassword },
        { uuid },
    );

    if (updateUser) {
        return success(
            httpStatus.OK,
            'Password updated Successfully!',
            {},
        );
    }

    return error(httpStatus.BAD_REQUEST, 'Password Update Failed!');
};



module.exports = {
    createUser,
    isEmailExists,
    loginWithEmailPassword,
    logoutAuth,
    getUserByUuid,
    changePassword,
}