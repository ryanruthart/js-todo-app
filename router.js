// import some of the express library
const express = require('express')
// make a reference to routers
const router = express.Router()
//import the user controller
const userController = require('./controllers/userController')

// root page
router.get('/', userController.home)

// register post request
router.post('/register', userController.register)

// export the router
module.exports = router
