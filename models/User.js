const bcrypt = require('bcryptjs')
const usersCollection = require('../db').db().collection('users')
const validator = require("validator")
const md5 = require('md5')

let User = function (data, getAvatar) {
  this.data = data
  this.errors = []
  if (getAvatar == undefined) {getAvatar = false}
  if (getAvatar) {this.getAvatar()}

}

User.prototype.validate = function() {
  return new Promise(async (resolve, rejec) => {
    // validating the input data server side
    if (this.data.username == "") {this.errors.push("You must provide a username")}
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("Your username can only contain letters and numbers")}
    if (!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address")}
    if (this.data.password == "") {this.errors.push("You must provide a valid password")}
    if (this.data.password.length > 0 && this.data.password.length < 12) {this.errors.push("Your password must be at least than 12 characters")}
    if (this.data.password.length > 50) {this.errors.push("Your password is too long, 50 character maximum")}
    if (this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Your username must be at least than 3 characters")}
    if (this.data.username.length > 30) {this.errors.push("Your username is too long")}

    // if the user name is valid, check to see if its taken
    if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      let usernameExists = await usersCollection.findOne({username: this.data.username})
      if (usernameExists) {this.errors.push("The username is already taken")}
    }

    // if the email is valid, check to see if its taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({email: this.data.email})
      if (emailExists) {this.errors.push("The email is already taken")}
    }
    resolve()
  })
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
  return new Promise(async (resolve, reject) => {
    // Validate user data
    this.cleanUp()
    await this.validate()
    // Only if validation passes then save user data into database
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.errors)
    }

  })
}

User.prototype.login = function() {

  return new Promise((resolve, reject) => {
    this.cleanUp()

    usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
      if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
        // after retrieving the attempted user data, add it to the current data
        this.data = attemptedUser
        // pull in the avatar link
        this.getAvatar()
        resolve("congrats")
      } else {
        reject('Invalid username / password!!!!!!!!')
      }

    }).catch(function () {
      reject("Please try again later")
    })

    })


}


User.prototype.getAvatar = function() {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}


User.findByUsername = function(username) {
  return new Promise(function(resolve, reject) {
    if (typeof(username) != "string") {
      reject()
      return
    }

    usersCollection.findOne({username: username}).then(function(userDoc) {
      if (userDoc) {
        userDoc = new User(userDoc, true)
        userDoc = {
          _id: userDoc.data._id,
          username: userDoc.data.username,
          avatar: userDoc.avatar
        }
        resolve(userDoc)
      } else {
        reject()
      }
    }).catch(function() {
      reject()
    })

  })
}

module.exports = User