const User = require('../models/User')

exports.login = function (req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
    // add a user to the session after log in success
    req.session.user = {username: user.data.username}
    res.send(result)
  }).catch(function(e) {
    res.send(e)
  })

}

exports.logout = function () {


}


exports.register = function (req, res) {
  let user = new User(req.body)
  user.register()
  if (user.errors.length) {
    res.send(user.errors)
  } else {
    res.send("Congrats, there are no errors.")
  }
  res.send("thanks for trying to register")
}



exports.home = function (req, res) {
  if (req.session.user) {
    res.send("Welcome back to the actual application")
  } else {
    res.render('home-guest')
  }



}