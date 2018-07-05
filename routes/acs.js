const express = require('express')
const router = express.Router()
const fetch = require('node-fetch') 
const threeDSSServerData = require('../appData/threeDSServerPData')
const appData = require('../appData/appInformation')
const eMessages = require('../mocks-3ds-server/protocolError')
const aResponses = require('../mocks-3ds-server/aResponses')
const utils = require('../misc/utils')

//handle the verification process
let checkUserData = (userData) => {
    return true
}


router.post('/authrequest', (request, response) => {

    aRes = aResponses.getBRWChallengeFlow() 
    eRes = eMessages.getGenericFormatError()
    eRes.errorMessageType = 'ARes'
    aRes.ascURL = appData.baseUrl + '/acs'

    if (request && request.body) {
        console.log("J'ai un body. Nice !");
        
        if (!appData.checkThreeDSVersion(request.body.messageVersion)) {
            console.log("version check failed");
            eRes.errorDescription = 'Bad version'
            response.json(eRes)
            return
        }
        if (checkUserData(request.body)) {
            console.log("True est bien égal à true");
            aRes.transStatus = "Y"
            response.json(aRes)
            return
        } else {
            console.log("True est en fait égal a false");
            aRes.transStatus = "C"
            response.json(aRes)
            return
        }
    }
    console.log("j'ai pas de body :(");
    
    eRes.errorDescription = 'Request body is empty'
    response(eRes.json())

})

module.exports = router