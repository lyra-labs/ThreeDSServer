const fetch = require('node-fetch') 
const appData = require('./appData/appInformation')
const areqmessages = require('./mocks-3ds-server/aRequests')
const aresmessages = require('./mocks-3ds-server/aResponses')
const cmessages = require('./mocks-3ds-server/cMessages')
const pmessages = require('./mocks-3ds-server/pMessages')
const rmessages = require('./mocks-3ds-server/rMessages')

let testForAlex = () => {

    console.log('Size of AREQ : ' + Buffer.byteLength(JSON.stringify(areqmessages.getARequest()), 'utf8'));
    console.log('Size of ARES : ' + Buffer.byteLength(JSON.stringify(aresmessages.getBRWChallengeFlow()), 'utf8'));
    console.log('Size of CREQ : ' + Buffer.byteLength(JSON.stringify(cmessages.getCRequest()), 'utf8'));
    console.log('Size of CRES : ' + Buffer.byteLength(JSON.stringify(cmessages.getCResponse()), 'utf8'));
    console.log('Size of PREQ : ' + Buffer.byteLength(JSON.stringify(pmessages.getPRequest()), 'utf8'));
    console.log('Size of PRES : ' + Buffer.byteLength(JSON.stringify(pmessages.getPResponse()), 'utf8'));
    console.log('Size of RREQ : ' + Buffer.byteLength(JSON.stringify(rmessages.getRRequest()), 'utf8'));
    console.log('Size of RRES : ' + Buffer.byteLength(JSON.stringify(rmessages.getRResponse()), 'utf8'));
}

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
    return fetch(appData.baseUrl +  '/merchant/pay', {
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
        return response
    })
}

let resultData = {}

let testRReq = () => {
    fetch(appData.baseUrl +  '/acs/challengeresult', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultData)
    })
    .then((response) => response.json())
    .then((response) => {
        console.log("test RREs response");
        
        console.log(JSON.stringify(response));
        
    })
}


module.exports = {
    testAreq,
    testRReq,
    testForAlex
}