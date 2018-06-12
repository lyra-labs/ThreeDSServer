const express = require('express')
const router = express.Router()
const threeDSSServerData = require('../appData/threeDSServerPData')
const appData = require('../appData/appInformation')
const pMessages = require('../mocks-3ds-server/pMessages')
const aRequests = require('../mocks-3ds-server/aRequests')

// Request the DS to update the Pres object
// Called every hour in /app.js

let requestThreeDSServerConfig = () => {

    threeDSSServerData.PResponseHeader = fetch('/ds/updatepres', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pMessages.getPRequest())
    })
    .then((response) => response.json())
    .then((response) => {
        if (response) {
            if (!response.version || !appData.checkThreeDSVersion(response.version)) {return {'status':'ko'}}
            if (!response.cardRangeData) {
                appData.data.isCardRanges = false
                return {'status': 'ko'}
            }
            return response
        }
        return {'status': 'ko'}
    })
}

// lauch AReq to the DS

let startAuthentication = () => {

    // check everything is clear
    // version is good
    // ranges are ok

    threeDSSServerData.AResponseHeader = fetch('/ds/authrequest', {
        method = 'POST',
        credentials = 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aRequests.getARequest())
    })
    .then((response) => response.json())
    .then((response) => {
        // do some stuff

    })

}

router.post('/starttransaction', (request, response) => {

})

module.exports = {
    router,
    requestThreeDSServerConfig
}