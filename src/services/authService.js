const User = require("../models").User;
const Token = require('../models').Token;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const { error, success } = require("../config/helper");
const { userConstant } = require("../config/constant");
const logger = require("../config/logger");
const { tokenTypes } = require("../config/tokens");
const { sendEmail } = require("../Email/sendEmail");


const createUser = async (userBody) => {
    try {
        const message = 'Successfully Registered the account! Please Verify your email.';
        if (await isEmailExists(userBody.email)) {
            return error(httpStatus.BAD_REQUEST, 'Email already taken');
        }

        if (await isTelExists(userBody.tel)) {
            return error(httpStatus.BAD_REQUEST, 'Tel already taken');
        }

        const uuid = uuidv4();
        userBody.email = userBody.email.toLowerCase();
        userBody.uuid = uuid;
        userBody.status = userConstant.STATUS_ACTIVE;
        // userBody.email_verified_at = userConstant.EMAIL_VERIFIED_FALSE;
        userBody.email_verification_code = generateRandomCode();

        const user = await createNewUser(userBody);

        if (!user) {
            message = 'Registration Failed! Please Try again.';
            return error(httpStatus.BAD_REQUEST, message);
        }
        
        
        // console.log(userBody.email_verification_code);
        // Send Email
        const options = {
            email: user.email,
            subject: "Confirmez votre inscription",
            message: "Code de verification d'email",
            email_verification_code: userBody.email_verification_code
        }
        await sendEmail(options);
        
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

const isTelExists = async (tel) => {
    return User.count({ where: { tel } }).then((count) => {
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
        verification_code:  userBody.email_verification_code,
        // email_verified_at:  userBody.email_verified_at,

    });

    return getOnlyUserData(user);
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
        return res.status(httpStatus.NOT_FOUND).send({ message: 'User Not found!' });
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

const getUserByUuid = async (uuidUser) => {
    try {
        const user = await User.findOne({ 
            uuid: uuidUser,
        });        
        return  user;
    } catch (e) {
        logger.error(e);
        return error(httpStatus.NOT_FOUND, e.message)        
    }
};


const generateRandomCode = () => {
    const min = 0;
    const max = Math.pow(10, 7);
    const randomCode = Math.floor(Math.random() * (max - min) + min);
    return randomCode.toString().padStart(7, '0');
};

const changePasswordService = async (data, uuid) => {
    let  message = 'Password updated Successfully!';
    let statusCode = httpStatus.OK;

    let user = await getUserByUuid(uuid)
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

    if (!isPasswordValid) {
        statusCode = httpStatus.BAD_REQUEST;
        message = 'Wrong old Password!';
        return error(statusCode, message);
    }

    // Salt & hashedPassword
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(data.password, salt)

    const updateUser = await user.update(
      { password: hashedPassword },
    );
    
    if (updateUser) {
        return success(
            httpStatus.OK,
            'Password updated Successfully!',
        );
    }

    return error(httpStatus.BAD_REQUEST, 'Password Update Failed!');
};


const confirmEmailService = async (data, uuid) => {
    let  message = 'Email confirmed Successful';
    let statusCode = httpStatus.OK;

    let user = await getUserByUuid(uuid)
    if (!user) {
        return error(httpStatus.NOT_FOUND, 'User Not found!');
    }


    if (data.verification_email_code !== user.verification_code) {
        return error(
            httpStatus.BAD_REQUEST,
            'Wrong verification code !',
        );
    }

    const updateUser = await user.update(
        { 
            email_verified_at: new Date(),
            verification_code: null
        }
    );
    
    if (updateUser) {

        const options = {
            email: user.email,
            subject: "Merci - Email confirmer",
            message: "Votre email a été confirmer ",
            // email_verification_code: userBody.email_verification_code
        }
        await sendEmail(options);

        return success(
            statusCode,
            message,
        );
    }

    return error(httpStatus.BAD_REQUEST, 'Email confirmed Failed!');
};



const sendResetPasswordCodeService = async (email) => {
    try {
        const message = 'Password reset code was sent Successful !';
        const statusCode = httpStatus.OK;
        let user = await User.findOne({ where:  { email: email.toLowerCase() } });

        if (user == null) {
            return error(
                httpStatus.BAD_REQUEST,
                'You are not registered!',                
            );
        }

        const code = generateRandomCode();
        
        const updateUser = await user.update({
            verification_code: code,
        });
        
        if (updateUser) {
            const options = {
                email: user.email,
                subject: "Password reset code",
                message: "Password reset code valid for 5 minutes",
                email_verification_code: code
            }
            await sendEmail(options);
            return success(statusCode, message);
            
        }
        
    } catch (e) {
        logger.error(e);
        return error(httpStatus.BAD_GATEWAY, 'Something Went Wrong!!');
    }
}


const confirmPasswordCodeService = async (data) => {
    let  message = 'Login Successful';
    let statusCode = httpStatus.OK;

    let user = await User.findOne({ 
        where:  { 
            email: data.email.toLowerCase(),
            verification_code: data.verification_code
        } 
    });
    

    if (user == null) {
        return error(
            httpStatus.BAD_REQUEST,
            'Wrong code!',                
        );
    }

    const currentDate = new Date();
    const fiveMinutesAgo = new Date(currentDate.getTime() - 5 * 60000);
    
    if (user.updatedAt < fiveMinutesAgo) {
        return error(
            httpStatus.BAD_REQUEST,
            'Your password reset code has expired',
        );
    }

    if (data.password !== data.confirm_password) {
        return error(
            httpStatus.BAD_REQUEST,
            'Confirm password not matched',
        );
    }

    // Salt & hashedPassword
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(data.password, salt)

    const updateUser = await user.update(
        {
            password: hashedPassword,
            verification_code: null
        },
    );
    
    if (updateUser) {
        const options = {
            email: user.email,
            subject: "Password reset successfully",
            message: "Your password has been successfully reset. If you are not at the origin of this action write to us at the email address at the bottom of the page",
            // email_verification_code: userBody.email_verification_code
        }
        await sendEmail(options);

        return success(
            httpStatus.OK,
            'Password updated Successfully!',
        );
    }

    return error(httpStatus.BAD_REQUEST, 'Password Update Failed!');
};


const updateUserService = async (userBody) => {
    try {
        const message = 'Account updated successfully!';

        let user = await getUserByUuid(userBody.uuid)
        if (!user) {
            message = 'This account does not exist.';
            return error(httpStatus.NOT_FOUND, message);
        }

        const updateUser = await user.update(
            {
                nom:            userBody.nom,
                prenoms:        userBody.prenoms,
                address:        userBody.address,
            },
        );
        
        if (updateUser) {
            user = getOnlyUserData(user)
            return success(httpStatus.CREATED, message, user);
        }
        
        
    } catch (e) {
        logger.error(e);
        return error(httpStatus.BAD_REQUEST, 'Something went wrong!');
    }
};

const getOnlyUserData = (user) => {
    const { nom, prenoms, address, email, tel, uuid,} = user;
    return {uuid, nom, prenoms, email, tel, address,};
}

module.exports = {
    createUser,
    isEmailExists,
    isTelExists,
    loginWithEmailPassword,
    logoutAuth,
    getUserByUuid,
    changePasswordService,
    confirmEmailService,
    sendResetPasswordCodeService,
    confirmPasswordCodeService,
    updateUserService,
}