const fetch = require('node-fetch')
const express = require('express')
const router = express.Router()
const appData = require('../appData/appInformation')
const uuidv1 = require('uuid/v1')
const search = require('../routes_process/researchFunctions')

let clients = []

// Call the 3DS Server to initiate transaction
let startThreeDSProtocole = (formBody) => {
    return fetch(appData.baseUrl + '/threedsserver/waitMethod', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
        .then((response) => response.json())
        .then((response) => {
            // TODO check any errors
            return response
        })

}

// It must receive an object containing cards information, complete adresse, email, card holder name
let checkPaymentData = (body) => {
    if (!body.cc_number || !body.email ||
        !body.cvv || !body.cc_date ||
        !body.price || !body.name ||
        !body.postcode || !body.city_name ||
        !body.phone_number || !body.address ||
        !body.threeDSServerTransID ||
        (body.challengeOption != true && body.challengeOption != false)) {
        return {
            'status': 'ko',
            'message': 'missing one or more field'
        }
    }
    body.status = 'ok'
    return body
}

// Handle the browser payment request

let doStartThreeDSProtocole = (checkeddData, oldResponse) => {
    let clientData = {}

    startThreeDSProtocole(checkeddData)
        .then((response) => {
            console.log("Return of startThreeDSProtocol from merchant.js");
            console.log(JSON.stringify(response))
            clientData.data = response
            // clients.push(clientData)

            oldResponse.json(response)
            // what contain the context of the response
            // data contain the related object
        })

}

// Initial request sent by client side
router.post('/pay', (request, response) => {

    if (!request || !request.body) {
        response.json({
            'status': 'ko',
            'message': 'Missing cc_number, date, price or cvv field'
        })
        return
    }

    let checkeddData = checkPaymentData(request.body)
    if (checkeddData.status === 'ko') {
        response.json(checkeddData)
        return
    }

    console.log("MERCHANT: RECIEVED INITIAL PAYMENT REQUEST");

    doStartThreeDSProtocole(checkeddData, response)
})

// save the response for afterCres confirmation
router.post('/requestConfirmation', (request, response) => {
    if (!request || !request.body) {
        response.json({ 'status': 'ko' })
        return
    }
    let userData = {}
    userData.acsTransID = request.body.acsTransID
    userData.confirmationResponse = response
    clients.push(userData)
    return
})

// Unused handler, the very end of the 3DS 2.1 protocole on my scope
router.post('/notification', (request, response) => {
    if (!request && !request.body) {
        response.json({
            'status': 'ko',
            'message': 'request failed'
        })
        console.log('NOTIFICATION: REQUEST FAILED');

        return
    }

    console.log('\nNOTIFICATION: RECIEVED: CRES :');

    console.log(request.body);

    let userData = search.getUserWithoutAresByTransID(request.body.acsTransID, clients)
    if (userData != null) {
        userData.confirmationResponse.json({ 'status': 'authentified' })
    }

    response.json({
        'status': 'ok',
        'message': 'ok'
    })

})

//
//  call the 3DS Server to get the 3DSMethod URL and the threeDSServerID
//

let doGet3DSMethod = (cc_number) => {
    return fetch(appData.baseUrl + '/threedsserver/getmethod', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cc_number)
    }).then((response) => response.json())
        .then((response) => response)
}


//handler the 3dsmethod client side initial request
router.post('/init', (request, response) => {
    if (!request.body) {
        response.json({ 'status': 'ko' })
        return
    }
    doGet3DSMethod(request.body)
        .then((threeDSMethodInfo) => {
            response.json(threeDSMethodInfo)
            return
        })

})

module.exports = router