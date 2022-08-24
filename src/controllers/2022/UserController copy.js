const { success, error } = require("../../config/helper");
const asyncHandler = require('express-async-handler')


const indexUser = asyncHandler (async (req, res) => {

    if (!req.body.text) {
        // res.status(400)
        res.json(error('400', "Not authorize"))
        
    }
    const message = 'Users from Controller';
    res.json(success(message, "products"))
    
    // res.status(200).json({ message: "Users from Controller"})
})

const getUser = asyncHandler (async (req, res) => {

    res.status(200).json({ message: "One User from Controller"})
})
 


module.exports = {
    indexUser,
    getUser
}