const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const fs = require('fs')

const config = require('./config.json')
const threeDSData = require('./appData/threeDSServerPData')

const DSroute = require('./routes/ds')
const ACSroute = require('./routes/acs')
const merchantroute = require('./routes/merchant')
const threeDSroute = require('./routes/threeDSServer')

const app = express()
const port = config.port;
app.use(bodyParser.json())

app.use('/ds', DSroute)
app.use('/acs', ACSroute)
app.use('/merchant', merchantroute)
app.use('/threedsserver', threeDSroute)

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
    console.log('HTTPS ON');
    
} else {
    app.listen(port)
}

// call at server application startup and every 1h (3600000 millisecond)
threeDSroute.requestThreeDSServerConfig();
setTimeout(threeDSroute.requestThreeDSServerConfig, 3600000)

console.log(`Started app on port ${port}`);

module.exports = app;