const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const fs = require('fs')

const config = require('./config.json')
const DSroute = require('./routes/ds.js')
const ACSroute = require('./routes/acs.js')
const merchantroute = require('./routes/merchant.js')
const threeDSroute = require('./routes/threeDSServer.js')

const app = express()
const port = config.port;
app.use(bodyParser.json())

app.use('/ds', DSroute)
app.use('/acs', ACSroute)
app.use('/merchant', merchantroute)
app.use('/threeDSServer', threeDSroute)

console.log(process.argv[2])

if (process.argv[2] && process.argv[2] === 'https') {
    let privateKey = fs.readFileSync('./certs/key.pem', 'utf8')
    let certificate = fs.readFileSync('./certs/cert.pem', 'utf8')

    if (!privateKey || !certificate) {
        console.log('Error: Cannot find ssl key or certificate')
        process.exit(1)
    }
    let credentials = { key: privateKey, cert: certificate }

    let httpsServer = https.createServer(credentials, app)
    httpsServer.listen(port)
} else {
    app.listen(port)
}

console.log(`Started app on port ${port}`);

module.exports = app;