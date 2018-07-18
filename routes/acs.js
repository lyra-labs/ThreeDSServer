const express = require('express')
const path = require('path')
const router = express.Router()
const fetch = require('node-fetch')
const threeDSSServerData = require('../appData/threeDSServerPData')
const appData = require('../appData/appInformation')
const eMessages = require('../mocks-3ds-server/protocolError')
const aResponses = require('../mocks-3ds-server/aResponses')
const rMessages = require('../mocks-3ds-server/rMessages')
const cMessages = require('../mocks-3ds-server/cMessages')
const utils = require('../misc/utils')

let DS_URL = ""

// will be called after the challenge result is validated
let sendResultRequest = (resultMessage) => {

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
            console.log('response JSONIFIED')
            console.log(response);

            return response
        })

}

let isChallengeCompleted = (request) => {

    console.log(JSON.stringify(request.body));
    
    if (!request || !request.body || !request.body.sms ||
        !request.body.password || !request.body.email) {
        return {
            'status': 'ko',
            'message': 'Missing one or more fields in the request'
        }
    }
    return { 'status': 'ok' }
}

let doSendCResponse = (oldResponse) => {

    let Rmessage = rMessages.getRRequest()
    sendResultRequest(Rmessage)
        .then((response) => {
            
            let Cres = cMessages.getCResponse()
            console.log("Result process is DONE");
            console.log(response);
            oldResponse.json(response)

            //
            //  TODO do something with rseponse
            // after my brain triggered, probably nothing for a demo
            // the real bank interaction start here
            //
        })
}

router.post('/challengeresult', (request, response) => {

    let challengeStatus = isChallengeCompleted(request)
    if (challengeStatus.status !== 'ok') {
        response.json(challengeStatus)
        return
    }

    console.log("triggered /challengeresult");
    doSendCResponse(response)

    // set le bon messageStatus pour le result avant de le passer
})


//
//  Handler the Authentication part as ACS
//

//handle the verification process
let checkUserData = (userData) => {
    return false
}

router.post('/authrequest', (request, response) => {

    aRes = aResponses.getBRWChallengeFlow()
    eRes = eMessages.getGenericFormatError()
    eRes.errorMessageType = 'ARes'
    aRes.ascURL = appData.baseUrl + '/acs'

    if (request && request.body) {

        if (!appData.checkThreeDSVersion(request.body.messageVersion)) {
            eRes.errorDescription = 'Bad version'
            response.json(eRes)
            return
        }

        DS_URL = request.body.dsURL
        if (checkUserData(request.body)) {
            aRes.transStatus = "Y"
            response.json(aRes)
            return
        } else {
            aRes.transStatus = "C"
            aRes.acsURL = appData.baseUrl + "/acs/clientchallenge"
            response.json(aRes)
            return
        }
    }

    eRes.errorDescription = 'Request body is empty'
    response(eRes.json())

})

router.post('/providechallenge', (request, response) => {
    if (request && request.body) {
        let content = request.body
        console.log("at least it reach");

        // if (!appData.checkThreeDSVersion(content.messageVersion)) {
        //     response('<p>ERROR</p>')
        // }
        // response.sendFile('/iframe.html');
        response.sendFile(path.resolve(__dirname + '/../static/iframe.html'));
        // response.sendFile(__dirname + '/../static/iframe.html');
    }

})

module.exports = router