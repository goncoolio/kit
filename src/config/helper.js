exports.success = (statusCode, message, data) => {
    return {
        statusCode,
        response: {
            status: true,
            message: message,
            data: data
        }
    }
}

exports.error = (statusCode, message, err) => {
    return {
        statusCode,
        response: {
            status: false,
            message: message,
            err: err,
        }
    }
}