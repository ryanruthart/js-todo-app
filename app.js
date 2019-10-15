// Initialize the express serving library
const express = require('express')
const app = express()

// Set the app to serve our public folder
app.use(express.static('public'))

// Set the folder for the views
app.set('views', 'views')
// set the javascript view rendering engine
app.set('view engine', 'ejs')


// View for root 
app.get('/', function(req, res){
    res.render('home-guest')
})


app.listen(3000)