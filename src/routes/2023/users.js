const users = require('express').Router()

users.get('/', (req, res) =>{
    res.json({ message: "Users 2023"})
})


module.exports = users