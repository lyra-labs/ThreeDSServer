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


router.post('/acs/authrequest', (request, response) => {

    aRes = aResponses.getBRWChallengeFlow() 
    eRes = eMessages.getGenericFormatError()
    eRes.errorMessageType = 'ARes'
    aRes.ascURL = appData.baseUrl + '/acs'

    if (request && request.body) {
        if (! appData.checkThreeDSVersion(request.body.messageVersion)) {
            eRes.errorDescription = 'Bad version'
            response.json(eRes)
        }
        if (checkUserData(request.body)) {
            aRes.transStatus = 'Y'
            response.json(aRes)
        } else {
            aRes.transStatus = 'C'
            response.json(aRes)
        }
    }
    eRes.errorDescription = 'Request body is empty'
    response(eRes.json())

})

module.exports = router