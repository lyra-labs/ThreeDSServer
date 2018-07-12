const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()
const threeDSSServerData = require('../appData/threeDSServerPData')
const pMessages = require('../mocks-3ds-server/pMessages')
const eMessages = require('../mocks-3ds-server/protocolError')
const appData = require('../appData/appInformation')

let URL_3DS_SERVER = ""

// Handle the PReq request and respond with a PRes

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


//
//  Beginning of Authentication (Areq / Ares) protocole
//


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
        .catch((error) => console.log('DS post to asc/authrequest error: ' + error))
}

// Handle the Areq from 3ds server

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
        if (request.body.messageType !== 'AReq') {
            response.json(request.body)
        }

        URL_3DS_SERVER = request.body.threeDSServerURL
        
        doSentAuthToACS(aReq, response)
        return

    }
    eRes.errorDescription = 'The request does not have a body'
    response.json(eRes)

})

//
//  Beginning of Result (RReq / RRes) protocole
//

let sendRRequestToThreeDSServer = (requestContent) => {
    return fetch(URL_3DS_SERVER + '/result', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestContent)
    })
        .then((response) => response.json())
        .then((response) => {
            console.log('response from threeDSserver to DS about Result request')
            console.log(response);

            return response
        })
}

let doSendRRequestToThreeDSServer = (requestContent, oldResponse) => {

    sendRRequestToThreeDSServer(requestContent)
        .then((response) => {
            console.log('In DS, ResultResponse from 3ds server to ACS');
            console.log(response);
            // include checks
            oldResponse.json(response)
            return
        })
        .catch((error) => console.log('error in DS resultResponse : ' + error))

}

router.post('/resulthandler', (request, response) => {

    let eRes = eMessages.getGenericFormatError()
    eRes.errorMessageType = 'RReq'
    if (request && request.body) {
        rReq = request.body
        if (!appData.checkThreeDSVersion(rReq.messageVersion)) {
            eRes.errorDescription = 'Bad version'
            response.json(eRes)
            return
        }
        if (rReq.messageType !== 'RReq') {
            eRes.errorDescription = 'Bad type'
            response.json(eRes)
        }
        doSendRRequestToThreeDSServer(request.body, response)
        return
    }
    eRes.errorDescription = "Empty body"
    response.json(eRes)

})

module.exports = router