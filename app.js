const express = require('express')
const app = express()

app.get('/', function(req, res){
    res.send("Welcome to the new app")
})

app.listen(3000)