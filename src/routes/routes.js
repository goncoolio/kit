/********************************************************
 #  @ALLAH                                                                      
 # قُلْ هُوَ ٱللَّهُ أَحَدٌ                                                     
 # ٱللَّهُ ٱلصَّمَدُ                                                            
 # لَمْ يَلِدْ وَلَمْ يُولَدْ                                                   
 # وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ                                          
 # Created Date  : Tuesday August 23rd 2022, 1:20:15 pm                         
 # License       : MIT                                                          
 # Author        : Ousmane Coulibaly                                            
 # Initials       : OC                                                          
 # Email         : info@hticnet.com                                             
 # Site web      : hticnet.com                                                  
 # HTIC-NETWORKS                                                                
 # Copyright (c) 2022  Htic-Networks SARL                                       
 ********************************************************/
const routes = require('express').Router();
const r2022 = require('./2022/r2022');
const r2023 = require('./2023/r2023');



// Routes 2022
routes.use('/2022/', r2022)

// Routes 2023
routes.use('/2023/', r2023)





module.exports = routes