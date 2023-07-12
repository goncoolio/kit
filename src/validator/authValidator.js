const Joi = require("joi");
const { error: errorTemplate, success, error } = require('../config/helper');
const httpStatus = require("http-status");


const changePasswordValidator  = async (req, res, next) => {
    // create schema object
    const schema = Joi.object({
        
        old_password: Joi.string().min(6).required().messages({
            'string.min': 'L\'ancien mot de passe doit avoir au moins 6 caractères.',
            'any.required': 'L\'ancien mot de passe est requis.'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Le mot de passe doit avoir au moins 6 caractères.',
            'any.required': 'Le mot de passe est requis.'
        }),
        confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Les mots de passe ne correspondent pas.',
            'any.required': 'La confirmation du mot de passe est requise.'
        }),
        uuid: Joi.string().required().min(36).max(36).messages({
            'string.min': "Le uuid n'est pas correct",
            'string.max': "Le uuid n'est pas correct",
            'any.required': 'Le uuid est requis'
        }),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: false, // ignore unknown props
        stripUnknown: false, // remove unknown props
    };

    // validate request body against schema
    const { error: validationError, value } = schema.validate(req.body, options);

    if (validationError) {
        // on fail return comma separated errors
        const errorMessage = validationError.details
            .map((details) => {
                return { 
                    field: details.path.join('.').replace(/\[|\]/g, ''),
                    msg: details.message.replace(/\"/g, ''),
                    value: details.context.value
                };
            });

        
        const e = error(httpStatus.BAD_REQUEST, errorMessage)

        return res.status(httpStatus.BAD_REQUEST).json(e);
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}

const registerValidator  = async (req, res, next) => {
    // create schema object
    const schema = Joi.object({
        nom: Joi.string().required().messages({
            'string.nom': 'Veuillez fournir un nom valide.',
            'any.required': "Le nom est requis."
        }),
        prenoms: Joi.string().required().messages({
            'string.prenoms': 'Veuillez fournir un prenoms valide.',
            'any.required': "Le prenom est requis."
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Veuillez fournir un email valide.',
            'any.required': "L'email est requis."
        }),
        tel: Joi.string().required().messages({
            'any.required': 'Le numéro de téléphone est requis.'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Le mot de passe doit avoir au moins 6 caractères.',
            'any.required': 'Le mot de passe est requis.'
        }),
        
        
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: false, // ignore unknown props
        stripUnknown: false, // remove unknown props
    };

    // validate request body against schema
    const { error: validationError, value } = schema.validate(req.body, options);

    if (validationError) {
        // on fail return comma separated errors
        const errorMessage = validationError.details
            .map((details) => {
                return { 
                    field: details.path.join('.').replace(/\[|\]/g, ''),
                    msg: details.message.replace(/\"/g, ''),
                    value: details.context.value
                };
            });

        
        const e = error(httpStatus.BAD_REQUEST, errorMessage)

        return res.status(httpStatus.BAD_REQUEST).json(e);
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}


const loginValidator  = async (req, res, next) => {
    // create schema object
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Veuillez fournir un email valide.',
            'any.required': "L'email est requis."
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Le mot de passe doit avoir au moins 6 caractères.',
            'any.required': 'Le mot de passe est requis.'
        }),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: false, // ignore unknown props
        stripUnknown: false, // remove unknown props
    };

    // validate request body against schema
    const { error: validationError, value } = schema.validate(req.body, options);

    if (validationError) {
        // on fail return comma separated errors
        const errorMessage = validationError.details
            .map((details) => {
                return { 
                    field: details.path.join('.').replace(/\[|\]/g, ''),
                    msg: details.message.replace(/\"/g, ''),
                    value: details.context.value
                };
            });

        const e = error(httpStatus.BAD_REQUEST, errorMessage)

        return res.status(httpStatus.BAD_REQUEST).json(e);
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}
const confirmEmailValidator  = async (req, res, next) => {
    // create schema object
    const schema = Joi.object({
        uuid: Joi.string().required().min(36).max(36).messages({
            'string.min': "Le uuid n'est pas correct",
            'string.max': "Le uuid n'est pas correct",
            'any.required': 'Le uuid est requis'
        }),
        verification_email_code: Joi.string().min(7).max(7).required().messages({
            'string.min': 'Le code de verification est au moins 7 chiffres.',
            'string.max': 'Le code de verification est au maximum 7 chiffres.',
            'any.required': 'Le mot de passe est requis.'
        }),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: false, // ignore unknown props
        stripUnknown: false, // remove unknown props
    };

    // validate request body against schema
    const { error: validationError, value } = schema.validate(req.body, options);

    if (validationError) {
        // on fail return comma separated errors
        const errorMessage = validationError.details
            .map((details) => {
                return { 
                    field: details.path.join('.').replace(/\[|\]/g, ''),
                    msg: details.message.replace(/\"/g, ''),
                    value: details.context.value
                };
            });

        const e = error(httpStatus.BAD_REQUEST, errorMessage)

        return res.status(httpStatus.BAD_REQUEST).json(e);
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}


const sendResetPasswordCodeValidator  = async (req, res, next) => {
    // create schema object
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Veuillez fournir un email valide.',
            'any.required': "L'email est requis."
        }),        
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: false, // ignore unknown props
        stripUnknown: false, // remove unknown props
    };

    // validate request body against schema
    const { error: validationError, value } = schema.validate(req.body, options);

    if (validationError) {
        // on fail return comma separated errors
        const errorMessage = validationError.details
            .map((details) => {
                return { 
                    field: details.path.join('.').replace(/\[|\]/g, ''),
                    msg: details.message.replace(/\"/g, ''),
                    value: details.context.value
                };
            });

        const e = error(httpStatus.BAD_REQUEST, errorMessage)

        return res.status(httpStatus.BAD_REQUEST).json(e);
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}


// const headerTokenValidator  = async (req, res, next) => {
//     // create schema object
//     const schema = Joi.object({
//         access_token: Joi.string().required().messages({
//             'string.access_token': 'Veuillez fournir un token valide.',
//             'any.required': "L'access token est requis."
//         }),
//         refresh_token: Joi.string().required().messages({
//             'string.refresh_token': 'Veuillez fournir un token valide.',
//             'any.required': "Le refresh token est requis."
//         }),
        
//     });

//     // schema options
//     const options = {
//         abortEarly: false, // include all errors
//         allowUnknown: true, // ignore unknown props
//         stripUnknown: true, // remove unknown props
//     };

//     // validate request body against schema
//     const { error: validationError, value } = schema.validate(req.headers, options);

//     if (validationError) {
//         // on fail return comma separated errors
//         const errorMessage = validationError.details
//             .map((details) => {
//                 return { 
//                     field: details.path.join('.').replace(/\[|\]/g, ''),
//                     msg: details.message.replace(/\"/g, ''),
//                     value: details.context.value
//                 };
//             });

//         const e = error(httpStatus.BAD_REQUEST, errorMessage)

//         return res.status(httpStatus.BAD_REQUEST).json(e);
//     } else {
//         // on success replace req.body with validated value and trigger next middleware function
//         req.body = value;
//         return next();
//     }
// }

const confirmPasswordCodeValidator  = async (req, res, next) => {
    // create schema object
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Veuillez fournir un email valide.',
            'any.required': "L'email est requis."
        }),
        verification_code: Joi.string().min(7).max(7).required().messages({
            'string.min': 'Le code de verification est au moins 7 chiffres.',
            'string.max': 'Le code de verification est au maximum 7 chiffres.',
            'any.required': 'Le mot de passe est requis.'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Le mot de passe doit avoir au moins 6 caractères.',
            'any.required': 'Le mot de passe est requis.'
        }),
        confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Les mots de passe ne correspondent pas.',
            'any.required': 'La confirmation du mot de passe est requise.'
        }),
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: false, // ignore unknown props
        stripUnknown: false, // remove unknown props
    };

    // validate request body against schema
    const { error: validationError, value } = schema.validate(req.body, options);

    if (validationError) {
        // on fail return comma separated errors
        const errorMessage = validationError.details
            .map((details) => {
                return { 
                    field: details.path.join('.').replace(/\[|\]/g, ''),
                    msg: details.message.replace(/\"/g, ''),
                    value: details.context.value
                };
            });

        const e = error(httpStatus.BAD_REQUEST, errorMessage)

        return res.status(httpStatus.BAD_REQUEST).json(e);
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}


const updateProfilValidator  = async (req, res, next) => {
    // create schema object
    const schema = Joi.object({
        nom: Joi.string().required().messages({
            'string.nom': 'Veuillez fournir un nom valide.',
            'any.required': "Le nom est requis."
        }),
        prenoms: Joi.string().required().messages({
            'string.prenoms': 'Veuillez fournir un prenoms valide.',
            'any.required': "Le prenom est requis."
        }),
        address: Joi.string().messages({
            'string.address': 'Veuillez fournir une adresse valide.',
        }),
        uuid: Joi.string().required().min(36).max(36).messages({
            'string.min': "Le uuid n'est pas correct",
            'string.max': "Le uuid n'est pas correct",
            'any.required': 'Le uuid est requis'
        }),
        // email: Joi.string().email().required().messages({
        //     'string.email': 'Veuillez fournir un email valide.',
        //     'any.required': "L'email est requis."
        // }),
        // tel: Joi.string().required().messages({
        //     'any.required': 'Le numéro de téléphone est requis.'
        // }),
       
        
        
    });

    // schema options
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };

    // validate request body against schema
    const { error: validationError, value } = schema.validate(req.body, options);

    if (validationError) {
        // on fail return comma separated errors
        const errorMessage = validationError.details
            .map((details) => {
                return { 
                    field: details.path.join('.').replace(/\[|\]/g, ''),
                    msg: details.message.replace(/\"/g, ''),
                    value: details.context.value
                };
            });

        
        const e = error(httpStatus.BAD_REQUEST, errorMessage)

        return res.status(httpStatus.BAD_REQUEST).json(e);
    } else {
        // on success replace req.body with validated value and trigger next middleware function
        req.body = value;
        return next();
    }
}


module.exports = {
    changePasswordValidator,
    registerValidator,
    loginValidator,
    // headerTokenValidator,
    confirmEmailValidator,
    sendResetPasswordCodeValidator,
    confirmPasswordCodeValidator,
    updateProfilValidator,
}