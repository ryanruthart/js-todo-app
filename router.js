// import some of the express library
const express = require('express')
// make a reference to routers
const router = express.Router()


// root page
router.get('/', function(req, res) {
  res.render('home-guest')
})


// about
router.get('/about', function(req, res) {
  res.send("TEST")
})

// export the router
module.exports = router
