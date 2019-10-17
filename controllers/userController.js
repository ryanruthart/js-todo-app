const User = require('../models/User')

exports.login = function (req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
    // add a user to the session after log in success
    req.session.user = {avatar: user.avatar, username: user.data.username}
    req.session.save(function() {
      res.redirect('/')
    })
  }).catch(function(e) {
    // add a flash section to the request
    req.flash('errors', e)
    req.session.save(function(){
      res.redirect('/')
    })
  })

}

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/')
  })
  
}


exports.register = function (req, res) {
  let user = new User(req.body)

  user.register().then(() => {
    req.session.user = {avatar: user.avatar, username: user.data.username}
    req.session.save(function() {
      res.redirect('/')
    })
  }).catch((regErrors) => {
    regErrors.forEach(function(error) {
      req.flash('regErrors', error)
    })
    req.session.save(function() {
      res.redirect('/')
    })
  })

  // res.send("thanks for trying to register")
}



exports.home = function (req, res) {
  if (req.session.user) {
    res.render('home-dashboard', {username: req.session.user.username, avatar: req.session.user.avatar})
  } else {
    res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
  }



}