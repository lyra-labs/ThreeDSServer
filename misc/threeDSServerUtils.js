const fetch = require('node-fetch')
const pMessages = require('../mocks-3ds-server/pMessages')
const appData = require('../appData/appInformation')
const threeDSSServerData = require('../appData/threeDSServerPData')

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
                console.log(JSON.stringify(response));

                if (!appData.checkThreeDSVersion(response.messageVersion)) {return { 'status': 'ko' }}

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

module.exports = {
    requestThreeDSServerConfig
}