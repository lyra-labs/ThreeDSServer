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
const utils = require('../misc/utils')

let clients = []

// take the request.body acsTransID as parameter and return the corresponding Areq or null

let getUserByThreeDSTransID = (threeDSServerTransID) => {
    for (let i = 0; i < clients.length; i++) {
        console.log(clients[i]);
        if (clients[i].threeDSServerTransID === threeDSServerTransID) {
            return clients[i]
        }
    }
    return null
}

let getUserByTransID = (transID) => {

    for (let i = 0; i < clients.length; i++) {
        console.log(clients[i]);
        if (clients[i].aRes.acsTransID === transID) {
            return clients[i]
        }
    }
    return null
}

//
// Starting non generic function
//

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
            console.log("Yeassa");

            if (statusResponse.status == 'ok') {
                response.json({ 'status': 'ok' })
            } else {
                response.json({ 'status': 'ko' })
            }
        })
})

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
//  Just return the 3DS Method URL to the DS
//

router.post('/getmethodurl', (request, response) => {

    // super hard coded because why not
    if (request) {
        response.json({ 'threeDSMethodURL': appData.baseUrl + '/acs/getMethodHTML' })
    }
})

router.post('/methodinformation', (request, response) => {
    if (!request.body) {
        response.json({ 'status': 'ko' })
        return
    }

    response.json({ 'status': 'ok' })
})

// check client side challenge result
let isChallengeCompleted = (request, client) => {

    console.log(JSON.stringify(request.body));

    //
    //  Out of PoC scope but takes client to check results
    //

    if (!request || !request.body || !request.body.sms ||
        !request.body.password || !request.body.email) {
        return {
            'status': 'ko',
            'message': 'Missing one or more fields in the request'
        }
    }
    return { 'status': 'ok' }
}

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

let doSendCResponse = (oldResponse, DS_URL, NOTIFICATION_URL, acsTransID) => {

    let Rmessage = rMessages.getRRequest()
    Rmessage.acsTransID = acsTransID
    sendResultRequest(Rmessage, DS_URL)
        .then((response) => {

            let Cres = cMessages.getCResponse()
            console.log("ACS: RECIEVED RRES, RESULT PROCESS IS DONE:");
            console.log(response);
            if (response.resultsStatus == '00') {
                Cres.notificationURL = NOTIFICATION_URL
                oldResponse.json(Cres)
                return
            }
            let err = eMessages.getGenericFormatError()
            err.errorDescription = 'RREQ failed'
            err.errorMessageType = 'RReq'
            oldResponse.json(err)

            //
            //  TODO do something with rseponse
            // after my brain triggered, probably nothing for a demo
            // the real bank interaction start here
            //
        })
}

router.post('/challengeresult', (request, response) => {

    let client = getUserByTransID(request.body.acsTransID)

    if (client != null) {
        let challengeStatus = isChallengeCompleted(request, client)

        if (challengeStatus.status !== 'ok') {
            response.json(challengeStatus)
            return
        }

        console.log("ACS: RECIEVED THE CHALLENGE SUBMITED FORM, SENDING RREQ:");

        doSendCResponse(response, client.DS_URL, client.NOTIFICATION_URL, client.aRes.acsTransID)
    }

    // set le bon messageStatus pour le result avant de le passer
})


//
//  Handler the Authentication part as ACS
//

//handle the verification process
let checkUserData = (userData) => {
    return false
}

let useMethodHashTheWayYouWant = (clientHash) => {
    return true
}

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

        let clientData = getUserByThreeDSTransID(request.body.threeDSServerTransID)


        useMethodHashTheWayYouWant(clientData.hash)

        console.log("ACS: RECIEVED A AREQ:");
        console.log(request.body);

        // tmp TODO need to die

        clientData.NOTIFICATION_URL = request.body.notificationURL
        clientData.DS_URL = request.body.dsURL
        aRes.acsTransID = uuidv1()
        aRes.threeDSServerTransID = clientData.threeDSServerTransID
        console.log('ACS UUID => ' + aRes.acsTransID);


        if (checkUserData(request.body)) {
            aRes.transStatus = "Y"
            clientData.aRes = aRes
            response.json(aRes)
            return
        } else {
            aRes.transStatus = "C"
            clientData.aRes = aRes
            aRes.acsURL = appData.baseUrl + "/acs/providechallenge"
            response.json(aRes)
            return
        }
    }

    eRes.errorDescription = 'Request body is empty'
    response.json(eRes)

})

// TODO ERROR HANDLING
router.post('/providechallenge', (request, response) => {
    if (request && request.body) {
        let content = request.body

        console.log("ACS: RECIEVED A CREQ, SENDING BACK HTML:");
        if (!appData.checkThreeDSVersion(content.messageVersion)) {
            response.send('<p>ERROR</p>')
            return
        }
        currentClient = getUserByTransID(request.body.acsTransID)
        if (currentClient != null) {
            // process what you want to. Maybe send custom challenges

            let fileContent = fs.readFileSync(path.resolve(__dirname + '/../static/iframe.html'), "utf8")
            fileContent = fileContent.replace("#!ACS_TRANS_ID!#", currentClient.aRes.acsTransID)

            response.send(fileContent);
            return
        }
        response.send('<p>UNKNOW USER</p>')
    }

})

module.exports = router