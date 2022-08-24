exports.success = (message, data) => {
    return {
        message,
        data
    }
}

exports.error = (err, message) => {
    return {
        err,
        message,        
    }
}