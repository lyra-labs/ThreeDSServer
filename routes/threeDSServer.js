const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()
const threeDSSServerData = require('../appData/threeDSServerPData')
const appData = require('../appData/appInformation')
const pMessages = require('../mocks-3ds-server/pMessages')
const aRequests = require('../mocks-3ds-server/aRequests')
const utils = require('../misc/utils')

// lauch AReq to the DS
let startAuthentication = (aReq) => {

    return threeDSSServerData.AResponseHeader = fetch(appData.baseUrl + '/ds/authrequest', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aReq)
    })
}

let getUpdatedAreq = (body) => {
    if (!body.cc_number || !body.email ||
        !body.cvv || !body.cc_date ||
        !body.price || !body.name ||
        !body.postcode || !body.city_name ||
        !body.phone_number || !body.address) {
        return (utils.jsonError('Missing a field in request'))
    }

    let aReq = aRequests.getARequest()
    aReq.shipAddrCity = body.city_name
    aReq.shipAddrPostCode = body.postcode
    aReq.cardExpiryDate = body.cc_date
    aReq.cardholderName = body.name
    return aReq
}

let processAres = (response) => {
    
    if (!appData.checkThreeDSVersion(response.messageVersion)) { return 'Bad Version' }
    else if (response.transStatus == 'C') { return 'Challenge'}
    else if (response.transStatus == 'Y') { return 'Authentified'}
    else if (response.transStatus == 'C') { return 'Try'}
    else if (response.transStatus == 'N') { return 'NonAuth'}
    else { return 'Error'}
    
}

router.post('/starttransaction', (request, response) => {
    if (!request.body) {
        response.json(utils.jsonError('Missing body in request'))
        return
    }
    let updatedAreq = getUpdatedAreq(request.body)
    let PResponseHeader = threeDSSServerData.PResponseHeader

    if (updatedAreq.status === 'ko') { response.json(updatedAreq); return }
    if (!utils.isCreditCardInRange(request.body.cc_number)) { response.json(utils.jsonError('Credit card number is not in 3DS2 range')); return }
    if (!appData.checkThreeDSVersion(updatedAreq.messageVersion)) { response.json(utils.jsonError('Not compatible version')); return }

    startAuthentication(updatedAreq)
        .then((response) => response.json())
        .then((response) => {
            console.log('in 3dsserver response from DS');

            console.log(JSON.stringify(response));
            processAres(response)
            // TODO check the Ares and continue process if necessary
            // TODO don't forget to use webauthn as a second factor
        })
        .catch((error) => console.log('threeDSServer post to ds/authrequest error: ' + error))
})

module.exports = router