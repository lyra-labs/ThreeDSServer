const threeDSData = require('../appData/threeDSServerPData') 

let jsonError = (message) => {
    return {
        'status': 'ko',
        'message': message
    }
}

let isCreditCardInRange = (cardNumber) => {
    let pRes = threeDSData.PResponseHeader 

    pRes.cardRangeData.forEach(elem => {
        if (cardNumber >= elem.startRange && cardNumber <= elem.endRange) {
            return true
        }
        
    })
    return false
}

module.exports = {
    jsonError,
    isCreditCardInRange
}