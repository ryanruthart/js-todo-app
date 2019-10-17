const dotenv = require('dotenv')
dotenv.config()

const mongodb = require('mongodb')

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true},
    function(err, client) {
        // if you require (import) this file it will export the client
        module.exports = client
        const app = require('./app')
        app.listen(process.env.PORT)
})

