const fetch = require('node-fetch') 
const express = require('express')
const router = express.Router()
const threeDSSServerData = require('../appData/threeDSServerPData')
const pMessages = require('../mocks-3ds-server/pMessages')
const eMessages = require('../mocks-3ds-server/protocolError')
const appData = require('../appData/appInformation')

// Handle the PReq request and respond with a PRes

router.post('/updatepres', (request, response) => {

    let pReq = {} 
    let eRes = eMessages.getGenericFormatError() 
    eRes.errorMessageType = 'ERes'

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

// Handle the AReq request and pass it to the ACS

router.post('/authrequest', (request, response) => {

})

router.post

module.exports = router