const logger = require('../config/logger')

const errorHandler = (err, req, res, next) => {
    logger.error(err)

    // res.statusCode vaut 200 tant que rien n'a été positionné :
    // sans ce test une erreur serveur serait renvoyée avec un code de succès
    const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500

    if (res.headersSent) {
        return next(err)
    }

    res.status(statusCode)

    res.json({
        statusCode,
        response: {
            status: false,
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        }
    })
}

module.exports = {
    errorHandler
}