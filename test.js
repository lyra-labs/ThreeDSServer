const fetch = require('node-fetch') 
const appData = require('./appData/appInformation')

let paymentData = {
    cc_number : '4111111111111111',
       email : 'a.b@c.d',
        cvv : '111',
        cc_date : '0919',
        price: '94 USD',
        name : 'bob',
        postcode : '30000',
        city_name : 'Toulouse',
        phone_number : '0600000000',
        address : 'Rue champêtre'
}

let testAreq = () => {
    fetch(appData.baseUrl +  '/merchant/pay', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
    .then((response) => response.json())
    .then((response) => {
        console.log("test response");
        
        console.log(JSON.stringify(response));
        
    })
}
module.exports = {
    testAreq
}