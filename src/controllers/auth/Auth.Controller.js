const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { error } = require('../../config/helper')
// const { error } = require('./src/config/helper');
const asyncHandler = require('express-async-handler')
const User = require('../../models').User

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { nom, prenoms, email, password, tel } = req.body

  if (!nom || !prenoms || !email || !password || !tel) {
    res.status(400)
    res.json(error('Please add all fields'));
  }

  // Check if user exists
  const userExists = await User.findOne({ 
    where: { email: email }
   })

  if (userExists) {
    // res.json(error('400', 'User already exists'))
    // throw new Error('User already exists')
    res.json(error('400', "User already exists"))
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const user = await User.create({
    nom,
    prenoms,
    email,
    tel,
    password: hashedPassword,
  })

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      tel: user.tel,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user email
  const user = await User.findOne({ where: { email: email } })

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid credentials')
  }
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user)
})

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

const logout = asyncHandler( async (req, res) => {
  // Invalidate the token
  
  req.user.token = null
  res.status(200).json({ message: 'Déconnexion réussie' })
  
})

module.exports = {
  register,
  login,
  getMe,
  logout,
}