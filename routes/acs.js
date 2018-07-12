const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const threeDSSServerData = require('../appData/threeDSServerPData')
const appData = require('../appData/appInformation')
const eMessages = require('../mocks-3ds-server/protocolError')
const aResponses = require('../mocks-3ds-server/aResponses')
const rMessages = require('../mocks-3ds-server/rMessages')
const utils = require('../misc/utils')

let DS_URL = ""

// will be called after a CRes is recieved
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

router.post('/challengeresult', (request, response) => {
    let Rmessage = rMessages.getRRequest()
    console.log("triggered /challengeresult");


    if ("all is ok") {
        sendResultRequest(Rmessage)
            .then((response) => {
                console.log("Result process is DONE");
                console.log(response);


                //
                //  TODO do something with rseponse
                // after my brain triggered, probably nothing for a demo
                // the real bank interaction start here
                //
            })
        // set le bon messageStatus pour le result avant de le passer
    }
})




router.post('/clientchallenge', (request, response) => {
    return false
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

module.exports = router