const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()
const threeDSSServerData = require('../appData/threeDSServerPData')
const pMessages = require('../mocks-3ds-server/pMessages')
const eMessages = require('../mocks-3ds-server/protocolError')
const appData = require('../appData/appInformation')

router.post('/updatepres', (request, response) => {

    let pReq = {}
    let eRes = eMessages.getGenericFormatError()
    eRes.errorMessageType = 'PReq'

    if (request.body) {
        pReq = request.body
        if (!appData.checkThreeDSVersion(pReq.messageVersion)) {
            eRes.errorDescription = 'Bad version'
            response.json(eRes)
            return
        }

        response.json(pMessages.getPResponse())
        return
    }
    eRes.errorDescription = 'Missing body'
    response.json(eRes)
})

// Handle the PReq request and respond with a PRes

let sendAuthToACS = (AReq) => {

    return fetch(appData.baseUrl + '/acs/authrequest', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(AReq)
    })
        .then((response) => response.json())
        .then((response) => {
            console.log('response JSONIFIED')
            console.log(response);

            return response
        })
}



// Handle the AReq request and pass it to the ACS

let doSentAuthToACS = (aReq, initialResponse) => {
    sendAuthToACS(aReq)
        .then((response) => {
            console.log("in DS / authrequst");
            console.log(response);

            initialResponse.json(response)
            return
        })
        // .catch((error) => console.log( 'DS post to asc/authrequest error: ' + error))
}

router.post('/authrequest', (request, response) => {

    let eRes = eMessages.getGenericFormatError
    let aReq = {}
    eRes.errorMessageType = 'AReq'
    if (request && request.body) {
        aReq = request.body
        if (!appData.checkThreeDSVersion(aReq.messageVersion)) {
            eRes.errorDescription = 'Bad version'
            response.json(eRes)
            return
        }

        doSentAuthToACS(aReq, response)
        return

    }
    eRes.errorDescription = 'The request does not have a body'
    response.json(eRes)

})

router.post

module.exports = router