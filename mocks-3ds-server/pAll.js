// Absolutly no idea of what this is
// Preparation messages

let getPRequest = () => {
    return {
        "threeDSServerRefNumber": "3DS_LOA_SER_PPFU_020100_00008",
        "threeDSServerOperatorID": "1jpeeLAWgGFgS1Ri9tX9",
        "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
        "messageType": "PReq",
        "messageVersion": "2.1.0",
        "serialNum": "66lM7xWInwjdqG1SSFk5"
    }
}

let getPResponse = () => {
    return {
        "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
        "dsTransID": "f25084f0-5b16-4c0a-ae5d-b24808a95e4b",
        "messageType": "PRes",
        "messageVersion": "2.1.0",
        "serialNum": "3q9oaApFqmznys47ujRg",
        "dsStartProtocolVersion": "2.1.0",
        "dsEndProtocolVersion": "2.1.0",
        "cardRangeData": [{
            "startRange": "1000000000000000",
            "endRange": "1000000000005000",
            "actionInd": "A",
            "acsStartProtocolVersion": "2.1.0",
            "acsEndProtocolVersion": "2.1.0",
            "threeDSMethodURL": "https://www.acs.com/script"
        },
        {
            "startRange": "2000000000000000",
            "endRange": "2000000000004000",
            "dsStartProtocolVersion": "2.1.0",
            "dsEndProtocolVersion": "2.1.0",
            "actionInd": "D",
            "acsStartProtocolVersion": "2.1.0",
            "acsEndProtocolVersion": "2.1.0",
            "threeDSMethodURL": "https://www.acs2.com/method"
        }]
    }
}

module.exports = {
    getPRequest,
    getPResponse
}