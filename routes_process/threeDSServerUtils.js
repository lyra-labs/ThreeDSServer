const fetch = require('node-fetch')
const pMessages = require('../mocks-3ds-server/pMessages')
const appData = require('../appData/appInformation')
const threeDSSServerData = require('../appData/threeDSServerPData')
const threeDSError = require('../mocks-3ds-server/protocolError')

let requestThreeDSServerConfig = () => {

    return threeDSSServerData.PResponseHeader = fetch(appData.baseUrl + '/ds/updatepres', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pMessages.getPRequest())
    })
        .then((response) => response.json())
        .then((response) => {
            if (response) {
                if (!appData.checkThreeDSVersion(response.messageVersion)) { return { 'status': 'ko' } }

                console.log("\n3DS SERVER: RECIEVED A PRES:");
                console.log(JSON.stringify(response));
                

                if (!response.cardRangeData) { // TODO check and log where does it pass
                    appData.data.isCarRanges = false
                    return { 'status': 'ko' }
                }
                threeDSSServerData.PResponseHeader = response
                return response
            }
            return { 'status': 'ko' }
        })
}

let respondWithError = (why, response, what) => {
    let finalResponse = {}

    if (why === 'Bad Version') {
        errResponse = threeDSError.getGenericFormatError()
        errResponse.errorMessageType = "Areq"
        errResponse.errorDescription = "Bad version"
        finalResponse.what = what
        finalResponse.data = errResponse
        response.json(final)
    } else {
        finalResponse.what = what
        finalResponse.data = why
        response.json(finalResponse)
    }
}

// letting differents functions because they might need
// to be specific later

let respondChallenge = (aRes, response, what) => {
    let finalResponse = {}

    finalResponse.what = what
    finalResponse.data = aRes
    response.json(finalResponse)
}

let respondAuthentified = (aRes, response, what) => {
    let finalResponse = {}

    finalResponse.what = what
    finalResponse.data = aRes
    response.json(finalResponse)
}

let respondTry = (aRes, response, what) => {
    let finalResponse = {}

    finalResponse.what = what
    finalResponse.data = aRes
    response.json(finalResponse)
}

let respondNop = (aRes, response, what) => {
     let finalResponse = {}

    finalResponse.what = what
    finalResponse.data = aRes
    response.json(finalResponse)
}


module.exports = {
    requestThreeDSServerConfig,
    respondChallenge,
    respondAuthentified,
    respondNop,
    respondTry,
}
