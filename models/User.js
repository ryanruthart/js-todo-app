const bcrypt = require('bcryptjs')
const usersCollection = require('../db').db().collection('users')
const validator = require("validator")


let User = function (data) {
  this.data = data
  this.errors = []

}

User.prototype.validate = function() {
  if (this.data.username == "") {this.errors.push("You must provide a username")}
  if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("Your username can only contain letters and numbers")}
  if (!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address")}
  if (this.data.password == "") {this.errors.push("You must provide a valid password")}
  if (this.data.password.length > 0 && this.data.password.length < 12) {this.errors.push("Your password must be at least than 12 characters")}
  if (this.data.password.length > 50) {this.errors.push("Your password is too long, 50 character maximum")}
  if (this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Your username must be at least than 3 characters")}
  if (this.data.username.length > 30) {this.errors.push("Your username is too long")}

}

User.prototype.cleanUp = function () {
  // Confirm all input types are strings
  if (typeof(this.data.username) != "string") {this.data.username = ""}
  if (typeof(this.data.email) != "string") {this.data.email = ""}
  if (typeof(this.data.password) != "string") {this.data.password = ""}

  // get rid of any bogus properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  }
}

User.prototype.register = function() {
  // Validate user data
  this.cleanUp()
  this.validate()
  // Only if validation passes then save user data into database
  if (!this.errors.length) {
    // hash user password
    let salt = bcrypt.genSaltSync(10)
    this.data.password = bcrypt.hashSync(this.data.password, salt)
    usersCollection.insertOne(this.data)
  }

}

User.prototype.login = function() {

  return new Promise((resolve, reject) => {
    this.cleanUp()

    usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
      if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
        resolve("congrats")
      } else {
        reject('Invalid username / password!!!!!!!!')
      }

    }).catch(function () {
      reject("Please try again later")
    })

    })


}




module.exports = User