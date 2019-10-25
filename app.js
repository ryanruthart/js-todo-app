// Initialize the express serving library
const express = require('express')

// express sessiosn library for login things
const session = require('express-session')

// mongo package to save sessions to database
const MongoStore = require('connect-mongo')(session)

// flash messaging package
const flash = require('connect-flash')

// initizlie the app
const app = express()

// set up the session options
let sessionOptions = session({
    secret: "Secret key is hard to guess when you do this!@#$fa$%Gaf211",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true}
})

app.use(sessionOptions)

app.use(flash())

// set it up to pass local user data to each session?
// must be before the router, so it gets the user data before the route is passed
app.use(function(req, res, next) {
    // make current user id available on the request object
    if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}

    // make all error and success flash messages available from all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    // make user sesion data avilable from within view templates
    res.locals.user = req.session.user
    next()
})

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

module.exports = app