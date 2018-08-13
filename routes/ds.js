const fetch = require('node-fetch')
const express = require('express')
const uuidv1 = require('uuid/v1')
const router = express.Router()
const threeDSSServerData = require('../appData/threeDSServerPData')
const pMessages = require('../mocks-3ds-server/pMessages')
const eMessages = require('../mocks-3ds-server/protocolError')
const appData = require('../appData/appInformation')
const search = require('../routes_process/researchFunctions')

let clients = []

//
//  Preparation protocol Pres / Preq
//

// request the ACS to get 3ds method url
let gethreeDSMethodURL = () => {
    return fetch(appData.baseUrl + '/acs/getmethodurl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: null
    })
        .then((response) => response.json())
        .then((response) => {
            return response
        })
}

// return the Pres to the 3DSServer
let doGetThreeDSMethodURL = (oldResponse) => {

    gethreeDSMethodURL()
        .then((response) => {
            let pRes = pMessages.getPResponse()
            pRes.cardRangeData[0].threeDSMethodURL = response.threeDSMethodURL
            oldResponse.json(pRes)
            return
        })
}

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
        console.log("\nDS: RECIEVED A PREQ:");
        console.log(JSON.stringify(pReq));

        doGetThreeDSMethodURL(response)
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

            return response
        })
}


// Handle the AReq request and pass it to the ACS

let doSentAuthToACS = (aReq, initialResponse, URL_3DS_SERVER) => {
    let clientData = {}
    clientData.URL_3DS_SERVER = URL_3DS_SERVER

    sendAuthToACS(aReq)
        .then((response) => {

            response.dsTransID = uuidv1()
            clientData.aRes = response
            clients.push(clientData)

            console.log("\nDS: RECIEVED A ARES, SENDING DIRECTLY TO THE 3DS SERVER");

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

        console.log("\nDS: RECIEVED A AREQ, SENDING DIRECTLY TO THE ACS");

        doSentAuthToACS(aReq, response, request.body.threeDSServerURL)
        return

    }
    eRes.errorDescription = 'The request does not have a body'
    response.json(eRes)

})

//
//  Beginning of Result (RReq / RRes) protocole
//

let sendRRequestToThreeDSServer = (requestContent, client) => {
    return fetch(client.URL_3DS_SERVER + '/result', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestContent)
    })
        .then((response) => response.json())
        .then((response) => {

            return response
        })
}

let doSendRRequestToThreeDSServer = (requestContent, oldResponse, client) => {

    sendRRequestToThreeDSServer(requestContent, client)
        .then((response) => {
            console.log("\nDS: RECIEVED A RRES, SENDING DIRECTLY TO THE ACS");

            // free the client from the list
            let clientData = search.getUserByTransID(response.acsTransID, clients)
            let index = clients.indexOf(clientData)
            if (index != -1) { clients.splice(index, 1) }

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

        let client = search.getUserByTransID(request.body.acsTransID, clients)

        if (client == null) {
            console.log("\nDS IN A RREQ CONTEXT: CAN'T FIND USER");

            eRes.errorDescription = "Unknow user"
            response.json(eRes)
        }

        console.log("\nDS: RECIEVED A RREQ, SENDING DIRECTLY TO THE 3DS SERVER");
        doSendRRequestToThreeDSServer(request.body, response, client)
        return
    }
    eRes.errorDescription = "Empty body"
    response.json(eRes)

})

module.exports = router