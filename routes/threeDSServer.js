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
const utils = require('../routes_process/utils')
const threeDSUtils = require('../routes_process/threeDSServerUtils')
const search = require('../routes_process/researchFunctions')

//list of clients currently processing
let clients = []

//
//  Start of the protocole AREQ / ARES
//

let getAresStatus = (response) => {

    if (!appData.checkThreeDSVersion(response.messageVersion)) { return 'Bad Version' }
    if (response.messageType == 'Erro') { return 'Error' }
    else if (response.transStatus == 'C') { return 'Challenge' }
    else if (response.transStatus == 'Y') { return 'Authentified' }
    else if (response.transStatus == 'C') { return 'Attempt' }
    else if (response.transStatus == 'N') { return 'NonAuth' }
    else { return 'Error' }
}

let startAuthentication = (aReq) => {

    return threeDSSServerData.AResponseHeader = fetch(appData.baseUrl + '/ds/authrequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aReq)
    })
}

let doStartAuthentication = (updatedAreq, oldResponse) => {

    startAuthentication(updatedAreq)
        .then((response) => response.json())
        .then((response) => {

            console.log("\n3DS SERVER: RECIEVED ARES");
            console.log(response);

            if (!response.threeDSServerTransID) {
                response.threeDSServerTransID = uuidv1()
            }

            let authStatus = getAresStatus(response)
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

// update AReq with merchant data
let getUpdatedAreq = (body) => {
    if (!body.cc_number || !body.email ||
        !body.cvv || !body.cc_date ||
        !body.price || !body.name ||
        !body.postcode || !body.city_name ||
        !body.phone_number || !body.address ||
        (body.challengeOption != true && body.challengeOption != false)) {
        return (utils.jsonError('Missing a field in request'))
    }

    let aReq = aRequests.getARequest()
    aReq.shipAddrCity = body.city_name
    aReq.email = body.email
    aReq.shipAddrPostCode = body.postcode
    aReq.cardExpiryDate = body.cc_date
    aReq.cardholderName = body.name
    aReq.threeDSServerTransID = body.threeDSServerTransID
    aReq.option = body.challengeOption
    return aReq
}

// handle the merchant request starting the protocole
let startTransaction = (request) => {

    let response = request.response

    if (!request.body) {
        response.json(utils.jsonError('Missing body in request'))
        return
    }

    let updatedAreq = getUpdatedAreq(request.body)
    let user = search.getUserByThreeDSTransID(request.body.threeDSServerTransID, clients)

    if (user != null && user.isMethodComplete == 'ok') {
        updatedAreq.threeDSCompInd = 'Y'
    }

    console.log("\n3DS SERVER: RECIEVED INITIAL PAYMENT REQUEST FROM MERCHANT");

    if (updatedAreq.status === 'ko') { response.json(updatedAreq); return }
    if (!utils.isCreditCardInRange(request.body.cc_number)) { response.json(utils.jsonError('Credit card number is not in 3DS2 range')); return }
    if (!appData.checkThreeDSVersion(updatedAreq.messageVersion)) { response.json(utils.jsonError('Not compatible version')); return }

    doStartAuthentication(updatedAreq, response)
}

//
// Handle the 3DS Method Notification request and set methodStatus to 'Y' if OK
//
router.post('/notificationMethod', (request, response) => {
    if (!request || !request.body || !request.body.threeDSServerTransID ||
        !request.body.methodStatus) {
        response.json({ 'status': 'ko' })
        return
    }


    // je pars du principe que la 3DS methode fonctionne, sinon ça marchera pas
    clientData = search.getUserByThreeDSTransID(request.body.threeDSServerTransID, clients)
    if (clientData) {
        clientData.isMethodComplete = request.body.methodStatus
        if (!clientData.waitingRequest) { return }
        startTransaction(clientData.waitingRequest)
    }
    console.log("METHOD COMPLETE AND NOTIFICATION RECIEDVED");

    response.json({ 'status': 'ok' })
})

// Take the payment request and store it waiting 3ds method to finish
router.post('/waitMethod', (request, response) => {
    if (!request || !request.body || !request.body.threeDSServerTransID) {
        response.json({ 'status': 'ko' })
        return
    }

    console.log("WAITMETHOD triggered");

    let userData = search.getUserByThreeDSTransID(request.body.threeDSServerTransID, clients)
    userData.waitingRequest = {}
    userData.waitingRequest.body = request.body
    userData.waitingRequest.response = response
    return
})

//
// Handle the RREq and return a RREs
//

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

        console.log("\n3DS SERVER: RECIEVED RREQ, CHECKING AND SENDING BACK RRES:");
        console.log(request.body);

        (request.body.transStatus === 'Y' || request.body.transStatus === 'A') ? Rres.resultsStatus = '00' : Rres.resultsStatus = '01'

        // clean up the user from the clients list (it is the last times it is used by this server)
        let userTosuppr = search.getUserByThreeDSTransID(request.body.threeDSServerTransID, clients)
        let index = clients.indexOf(userTosuppr)
        if (index != -1) { clients.splice(index, 1) }

        response.json(Rres)
        return
    }
    eMessage.errorDescription = 'Request failed, missing body'
    response.json(eMessage)
})


//
// Provide the 3DSMethodUrl, the 3DSMethodNotificationURl and the ThreeDSServerTransID to the requestor
//

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
        response.json({ 'status': 'ko' })
        return
    }

    let clientData = {}
    methodData.threeDSServerTransID = uuidv1()
    methodData.notificationMethodURL = appData.baseUrl + '/threedsserver/notificationMethod'
    clientData.threeDSServerTransID = methodData.threeDSServerTransID
    clients.push(clientData)
    response.json(methodData)
})

module.exports = router