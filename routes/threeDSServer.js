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
        method : 'POST',
        credentials : 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aReq)
    })
    .then((response) => response.json())
    .then((response) => {
        console.log('auth result received')
        console.log(JSON.stringify(response));
    })
}

let getUpdatedAreq = (formBody) => {
    if (!body.cc_number    || !body.email ||
        !body.cvv          || !body.cc_date ||
        !body.price        || !body.name ||
        !body.postcode     || !body.city_name ||
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

router.post('/starttransaction', (request, response) => {
    if (!request.body) {
        response.json(utils.jsonError('Missing body in request'))
        return
    }
    let updatedAreq = getUpdatedAreq(request.body)
    let PResponseHeader = appData.threeDSSServerData.PResponseHeader

    if (updatedAreq.status === 'ko') {response.json(updatedAreq)}
    if (!utils.isCreditCardInRange(request.body.cc_number)) {response.json(utils.jsonError('Credit card number is not in 3DS2 range'))}
    if (updatedAreq.messageVersion !== appData.data.version) {response.json(utils.jsonError('Not compatible version'))}

    startAuthentication(updatedAreq)
    .then((response) => response.json())
    .then((response) => {
        console.log(JSON.stringify(response));
        // TODO check the Ares and continue process if necessary
        // TODO don't forget to use webauthn as a second factor
    })

})

module.exports = router