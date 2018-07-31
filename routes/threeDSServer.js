const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()
const uuidv1 = require('uuid/v1')
const threeDSSServerData = require('../appData/threeDSServerPData')
const appData = require('../appData/appInformation')
const pMessages = require('../mocks-3ds-server/pMessages')
const aRequests = require('../mocks-3ds-server/aRequests')
const eMessages = require('../mocks-3ds-server/protocolError')
const rMessages = require('../mocks-3ds-server/rMessages')
const utils = require('../misc/utils')
const threeDSUtils = require('../misc/threeDSServerUtils')

let clients = []

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
    aReq.email = body.email
    aReq.shipAddrPostCode = body.postcode
    aReq.cardExpiryDate = body.cc_date
    aReq.cardholderName = body.name
    return aReq
}

let processAres = (response) => {

    if (!appData.checkThreeDSVersion(response.messageVersion)) { return 'Bad Version' }
    if (response.messageType == 'Erro') { return 'Error' }
    else if (response.transStatus == 'C') { return 'Challenge' }
    else if (response.transStatus == 'Y') { return 'Authentified' }
    else if (response.transStatus == 'C') { return 'Attempt' }
    else if (response.transStatus == 'N') { return 'NonAuth' }
    else { return 'Error' }
}

let doStartAuthentication = (updatedAreq, oldResponse) => {

    startAuthentication(updatedAreq)
        .then((response) => response.json())
        .then((response) => {


            response.threeDSServerTransID = uuidv1()
            console.log(response.threeDSServerTransID);

            console.log("3DS SERVER: RECIEVED ARES");
            console.log(response);
            let authStatus = processAres(response)
            switch (authStatus) {
                case 'Bad Version':
                    threeDSUtils.respondWithError('Bad version', oldResponse, authStatus)
                    break;
                case 'Challenge':
                    threeDSUtils.respondChallenge(response, oldResponse, authStatus);
                    break;
                case 'Authentified':
                    threeDSUtils.respondAuthentified(response, oldResponse, authStatus); // OK
                    break;
                case 'Attempt':
                    threeDSUtils.respondAttempt(response, oldResponse, authStatus); // Tentative d'auth, on connais pas le résultat mais ça passe il est auth
                    break;
                case 'NonAuth': // KO
                    threeDSUtils.respondNop(response, oldResponse, authStatus);
                    break;
                default:
                    threeDSUtils.respondWithError(response, oldResponse, authStatus);
                    break;
            }
        })
        .catch((error) => console.log('threeDSServer post to ds/authrequest error: ' + error))
}

router.post('/starttransaction', (request, response) => {

    if (!request.body) {
        response.json(utils.jsonError('Missing body in request'))
        return
    }

    let updatedAreq = getUpdatedAreq(request.body)
    let PResponseHeader = threeDSSServerData.PResponseHeader

    console.log("3DS SERVER: RECIEVED INITIAL PAYMENT REQUEST FROM MERCHANT");

    if (updatedAreq.status === 'ko') { response.json(updatedAreq); return }
    if (!utils.isCreditCardInRange(request.body.cc_number)) { response.json(utils.jsonError('Credit card number is not in 3DS2 range')); return }
    if (!appData.checkThreeDSVersion(updatedAreq.messageVersion)) { response.json(utils.jsonError('Not compatible version')); return }

    doStartAuthentication(updatedAreq, response)
})

router.post('/result', (request, response) => {

    let Rres = rMessages.getRResponse()
    let eMessage = eMessages.getGenericFormatError()
    eMessage.errorMessageType = 'RRes'

    if (request && request.body) {
        if (!appData.checkThreeDSVersion(request.body.messageVersion)) {
            eMessage.errorDescription = 'Bad version'
            response.json(eMessage)
            return
        }

        console.log("3DS SERVER: RECIEVED AREQ, CHECKING AND SENDING BACK ARES:");
        console.log(JSON.stringify(request.body));

        (request.body.transStatus === 'Y' || request.body.transStatus === 'A') ? Rres.resultsStatus = '00' : Rres.resultsStatus = '01'
        response.json(Rres)
        return
    }
    eMessage.errorDescription = 'Request failed, missing body'
    response.json(eMessage)
})

router.post('/getmethod', (request, response) => {

    let methodData = {}
    methodData.status = 'ok'
    pRes = threeDSSServerData.PResponseHeader;
    methodData.threeDSMethodURL = null

    if (!request.body) {
        response.json({ 'status': 'ko' })
        return
    }

    // select the good method url using the cc_number
    pRes.cardRangeData.forEach(elem => {
        if (request.body.cc_number >= elem.startRange && request.body.cc_number <= elem.endRange) {
            methodData.threeDSMethodURL = elem.threeDSMethodURL;
        }
    })
    if (methodData.threeDSMethodURL == null) {
        response.json({'status':'ko'})
        return
    }

    let clientData = {}
    methodData.threeDSServerTransID = uuidv1()
    clientData.threeDSServerTransID = methodData.threeDSServerTransID
    clients.push(clientData)
    response.json(methodData)
})

module.exports = router