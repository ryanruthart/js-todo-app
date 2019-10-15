// Initialize the express serving library
const express = require('express')
const app = express()

const router = require('./router')

// set up express to pass form values
app.use(express.urlencoded({extended: false}))
// tell app to accept json data
app.use(express.json())


// Set the app to serve our public folder
app.use(express.static('public'))

// Set the folder for the views
app.set('views', 'views')
// set the javascript view rendering engine
app.set('view engine', 'ejs')

// set up the router from import
app.use('/', router)

app.listen(3000)