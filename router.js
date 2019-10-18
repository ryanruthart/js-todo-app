// import some of the express library
const express = require('express')
// make a reference to routers
const router = express.Router()
//import the user controller
const userController = require('./controllers/userController')
//import the post controller
const postController = require('./controllers/postController')


// root page
router.get('/', userController.home)

// register post request
router.post('/register', userController.register)

// user sign in
router.post('/login', userController.login)

// user logout
router.post('/logout', userController.logout)


//////////////
// POSTS

// create post
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)

// create a new post with post request
router.post('/create-post', userController.mustBeLoggedIn, postController.create)

// render a post
router.get('/post/:id', postController.viewSingle)


// export the router
module.exports = router
