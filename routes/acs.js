const express = require('express')
const path = require('path')
const router = express.Router()
const fetch = require('node-fetch')
const uuidv1 = require('uuid/v1')
const fs = require('fs')
const threeDSSServerData = require('../appData/threeDSServerPData')
const appData = require('../appData/appInformation')
const eMessages = require('../mocks-3ds-server/protocolError')
const aResponses = require('../mocks-3ds-server/aResponses')
const rMessages = require('../mocks-3ds-server/rMessages')
const cMessages = require('../mocks-3ds-server/cMessages')
const utils = require('../routes_process/utils')
const acsProcessor = require('../routes_process/acsDataProcess')
const search = require('../routes_process/researchFunctions')

// list of the clients
let clients = []

//
// Components of the 3DS Method
//

//  Just return the 3DS Method URL to the DS (Part of the Preq-Pres exchange)
router.post('/getmethodurl', (request, response) => {
    if (request) {
        response.json({ 'threeDSMethodURL': appData.baseUrl + '/acs/getMethodHTML' });
    }
});


// Send the validation the the 3DS Method Notification URL
let validateMethod = (notificationMethodURL, threeDSServerTransID) => {
    confirmationRequest = {}
    confirmationRequest.threeDSServerTransID = threeDSServerTransID
    confirmationRequest.methodStatus = 'ok'

    return fetch(notificationMethodURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(confirmationRequest)
    })
        .then((response) => response.json())
        .then((response) => {
            return response
        })
}

// recieve the data from the 3DS method Iframe, store it, and initiate validation to the 3DS Server
router.post('/handleMethodInfo', (request, response) => {

    if (!request || !request.body || !request.body.threeDSServerTransID || !request.body.hash ||
        !request.body.notificationMethodURL) {
        response.json({ 'status': 'ko' })
        return
    }

    let clientData = {}

    clientData.threeDSServerTransID = request.body.threeDSServerTransID
    clientData.hash = request.body.hash
    clients.push(clientData)

    validateMethod(request.body.notificationMethodURL, request.body.threeDSServerTransID)
        .then((statusResponse) => {

            if (statusResponse.status == 'ok') {
                response.json({ 'status': 'ok' })
            } else {
                response.json({ 'status': 'ko' })
            }
        })
})

// Send back the HTML file containing the challenge that must be displayed in the Iframe 
router.post('/getMethodHTML', (request, response) => {


    if (request.body && request.body.threeDSServerTransID && request.body.notificationMethodURL) {

        let fileContent = fs.readFileSync(path.resolve(__dirname + '/../static/fingerPrinter.html'), "utf8")
        fileContent = fileContent
            .replace("#!3DS_TRANS_ID!#", request.body.threeDSServerTransID)
            .replace("#!NOTIFICATION_METHOD_URL!#", request.body.notificationMethodURL)

        response.send(fileContent);
        return
    }
    response.send('<p>ERROR</p>')
})

//
// Challenge part, It recieve the challenge result from the Iframe
//

// will be called after the challenge result is validated
let sendResultRequest = (resultMessage, DS_URL) => {

    return fetch(DS_URL + '/resulthandler', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultMessage)
    })
        .then((response) => response.json())
        .then((response) => {
            return response
        })
}

let doSendRequestAndReturnCResponse = (oldResponse, DS_URL, NOTIFICATION_URL, acsTransID, threeDSServerTransID) => {

    let Rmessage = rMessages.getRRequest()
    Rmessage.acsTransID = acsTransID
    Rmessage.threeDSServerTransID = threeDSServerTransID
    sendResultRequest(Rmessage, DS_URL)
        .then((response) => {

            let Cres = cMessages.getCResponse()
            Cres.threeDSServerTransID = threeDSServerTransID
            Cres.acsTransID = acsTransID
            let userData = search.getUserByTransID(acsTransID, clients)
            let index = clients.indexOf(acsTransID)
            console.log("\nACS: RECIEVED RRES, RESULT PROCESS IS DONE:");
            console.log(response);
            if (response.resultsStatus == '00') {
                Cres.notificationURL = NOTIFICATION_URL
                if (index != -1) { clients.splice(index, 1) }
                oldResponse.json(Cres)
                return
            }
            let err = eMessages.getGenericFormatError()
            err.errorDescription = 'RREQ failed'
            err.errorMessageType = 'RReq'
            if (index != -1) { clients.splice(index, 1) }
            oldResponse.json(err)

            // END OF PROCESS FOR ACS

        })
}

// Handle the result of the Creq challenge
router.post('/challengeresult', (request, response) => {

    let client = search.getUserByTransID(request.body.acsTransID, clients)

    if (client != null) {
        let challengeStatus = acsProcessor.isChallengeCompleted(request, client)

        if (challengeStatus.status !== 'ok') {
            response.json(challengeStatus)
            return
        }
        console.log("\nACS: RECIEVED THE CHALLENGE SUBMITED FORM, SENDING RREQ:");
        doSendRequestAndReturnCResponse(response, client.DS_URL, client.NOTIFICATION_URL, client.aRes.acsTransID, request.body.threeDSServerTransID)
    }

    // set le bon messageStatus pour le result avant de le passer
})

// return as a HTML file the challenge to the requestor, take a CReq as request param
router.post('/providechallenge', (request, response) => {
    if (request && request.body) {
        let content = request.body

        console.log("\nACS: RECIEVED A CREQ, SENDING BACK HTML:");
        if (!appData.checkThreeDSVersion(content.messageVersion)) {
            response.send('<p>ERROR</p>')
            return
        }
        currentClient = search.getUserByTransID(request.body.acsTransID, clients)
        if (currentClient != null) {
            // process what you want to. Maybe send custom challenges

            let fileContent = fs.readFileSync(path.resolve(__dirname + '/../static/iframe.html'), "utf8")
            fileContent = fileContent.replace("#!ACS_TRANS_ID!#", currentClient.aRes.acsTransID)
                .replace('#!3DS_TRANS_ID!#', request.body.threeDSServerTransID)

            response.send(fileContent);
            return
        }
        response.send('<p>UNKNOW USER</p>')
    }

})

//
//  Handler the Authentication part as ACS
//

// take a Areq and return a AREs
// can perform analysis with the 3DS Method browser HASH
router.post('/authrequest', (request, response) => {

    let aRes = aResponses.getBRWChallengeFlow()
    let eRes = eMessages.getGenericFormatError()
    eRes.errorMessageType = 'ARes'

    if (request && request.body) {

        if (!appData.checkThreeDSVersion(request.body.messageVersion)) {
            eRes.errorDescription = 'Bad version'
            response.json(eRes)
            return
        }

        let clientData = search.getUserByThreeDSTransID(request.body.threeDSServerTransID, clients)
        if (!clientData) {
            clientData = {}
        }

        acsProcessor.useMethodHashTheWayYouWant(clientData.hash)

        console.log("\nACS: RECIEVED A AREQ:");
        console.log(request.body);

        clientData.NOTIFICATION_URL = request.body.notificationURL
        clientData.DS_URL = request.body.dsURL
        aRes.acsTransID = uuidv1()
        aRes.threeDSServerTransID = clientData.threeDSServerTransID

        if (acsProcessor.checkUserData(request.body)) {
            console.log("LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            
            aRes.transStatus = "Y"
            aRes.acsURL = ""
            aRes.authenticationType = ""
            aRes.acsChallengeMandated = ""
            clientData.aRes = aRes
            if (!clientData.threeDSServerTransID) { clients.push() }
            response.json(aRes)
            return
        } else {
            aRes.transStatus = "C"
            clientData.aRes = aRes
            // Set the challenge mode if the analyser ask for it
            aRes.acsURL = appData.baseUrl + "/acs/providechallenge"

            if (!clientData.threeDSServerTransID) {
                clients.push(clientData)
            }
            response.json(aRes)
            return
        }
    }
    eRes.errorDescription = 'Request body is empty'
    response.json(eRes)
})


module.exports = router