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
 const helmet =  require("helmet");
 const cors = require('cors');
 const { error } = require('./src/config/helper');
 const routes = require('./src/routes/routes');
 const app = express();
 const env = require('dotenv').config()
 
 
 app.use(express.json())
 app.use(express.urlencoded({ extended: false}))
 // Use Helmet!
 app.use(helmet());
 
 // Change X-Powered-By
 // app.set('X-Powered-By', 'Htic-Networks');
 app.use(function (req, res, next) {
     res.setHeader('X-Powered-By', 'Htic-Networks')
     next()
 })
 // app.use(errorHandler)
 // Routes
 app.use(
     cors({
         origin: [ 'http://localhost:3000', 'http://localhost:5173', 'https://app.example.com' ],
         optionsSuccessStatus: 200,
         credentials: true
     })
 );
 app.use('/', routes)
 
 
 // If route not exist
 app.use((req, res, next) => {
     res.json(error('403', "FORBIDDEN"))
 })
 
 const PORT = process.env.PORT || 5200
 app.listen(PORT, () => {
     console.log('Kit Server API Start !')
 })
 