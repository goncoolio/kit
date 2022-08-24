/********************************************************
 #  @ALLAH                                                                      
 # قُلْ هُوَ ٱللَّهُ أَحَدٌ                                                     
 # ٱللَّهُ ٱلصَّمَدُ                                                            
 # لَمْ يَلِدْ وَلَمْ يُولَدْ                                                   
 # وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ                                          
 # Created Date  : Tuesday August 23rd 2022, 12:33:26 pm                        
 # License       : MIT                                                          
 # Author        : Ousmane Coulibaly                                            
 # Initials       : OC                                                          
 # Email         : info@hticnet.com                                             
 # Site web      : hticnet.com                                                  
 # HTIC-NETWORKS                                                                
 # Copyright (c) 2022  Htic-Networks SARL                                       
 ********************************************************/
const express = require('express');
const { error } = require('./src/config/helper');
const { errorHandler } = require('./src/middleware/errorMiddleware');
const routes = require('./src/routes/routes');
const app = express();
const env = require('dotenv').config()


app.use(express.json())
app.use(express.urlencoded({ extended: false}))

// Change X-Powered-By
// app.set('X-Powered-By', 'Htic-Networks');
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'Htic-Networks')
    next()
})
app.use(errorHandler)
// Routes
app.use('/', routes)

// If route not exist
app.use((req, res, next) => {
    res.json(error('404', "Route not found"))
})

const PORT = process.env.PORT || 5200
app.listen(PORT, () => {
    console.log('Serveur starter Kit Start !')
})