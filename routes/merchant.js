const express = require('express')
const router = express.Router()


// Call the 3DS Server to initiate transaction
let startThreeDSProtocole = (formBody) => {
    return  fetch('/threedsserver/starttransaction', {
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
         !body.phone_number || !body.adress) { 
             return {
                'status': 'ko',
                'message': 'missing one or more payment field'    
             }
        }
        body.status = 'ok'
        return body
}

// Handle the browser payment request

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

        startThreeDSProtocole(checkeddData)
        .then((response) => {
            // TODO do something cool
        })
})

module.exports = router