const fetch = require('node-fetch') 
const express = require('express')
const router = express.Router()
const appData = require('../appData/appInformation')


// Call the 3DS Server to initiate transaction
let startThreeDSProtocole = (formBody) => {
    return  fetch(appData.baseUrl + '/threedsserver/starttransaction', {
            method : 'POST',
            credentials: 'none',
            headers: {
                'Content-Type' : 'application/json'
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
     if (!body.cc_number    || !body.email ||
         !body.cvv          || !body.cc_date ||
         !body.price        || !body.name ||
         !body.postcode     || !body.city_name ||
         !body.phone_number || !body.address) { 
             return {
                'status': 'ko',
                'message': 'missing one or more payment field'    
             }
        }
        body.status = 'ok'
        return body
}

// Handle the browser payment request

let doStartThreeDSProtocole = (checkeddData, oldResponse) => {
        startThreeDSProtocole(checkeddData)
        .then((response) => {
            console.log("Return of startThreeDSProtocol from merchant.js");
            console.log(JSON.stringify(response))
            oldResponse.json(response)
            // what contain the context of the response
            // data contain the related object
        })

}

router.post('/pay', (request, response) => {
    if (!request.body) {
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

        doStartThreeDSProtocole(checkeddData, response)
})

module.exports = router