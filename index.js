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