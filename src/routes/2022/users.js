const users = require('express').Router()



users.get('/', (req, res) => {
    res.json({ message: 'Hello users from api'})
})




module.exports = users