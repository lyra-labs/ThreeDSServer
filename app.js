const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const config = require('./config.json')
const threeDSData = require('./appData/threeDSServerPData')
const threeDSUtils = require('./routes_process/threeDSServerUtils')

const DSroute = require('./routes/ds')
const ACSroute = require('./routes/acs')
const merchantroute = require('./routes/merchant')
const threeDSroute = require('./routes/threeDSServer')

// testing module

const my_test = require('./test')

//9095

const app = express()
const port = config.port;

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'static')));

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

// my_test.testForAlex()

// call at server application startup and every 1h (3600000 millisecond)
setInterval(threeDSUtils.requestThreeDSServerConfig, 3600000)

threeDSUtils.requestThreeDSServerConfig()

console.log(`Started app on port ${port}`);

module.exports = app;