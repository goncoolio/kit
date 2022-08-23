const express = require('express');
const routes = require('./src/routes/routes');
const app = express();
const dotenv = require('dotenv').config()


app.use(express.urlencoded({ extended: true}))

// Routes
app.use('/', routes)


const PORT = process.env.PORT || 5200
app.listen(PORT, () => {
    console.log('Serveur starter Kit Start !')
})