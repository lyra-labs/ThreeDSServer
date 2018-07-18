// ARes message samples
// Not sure about where does it goes and comes from
// TODO lean about it

// authentication mesages 

// getter for Challenge flow object
// APP

let getAppChallengeFlowObject = () => {
    return {
        "messageVersion": "2.1.0",
        "dsTransID": "f25084f0-5b16-4c0a-ae5d-b24808a95e4b",
        "messageType": "ARes",
        "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
        "acsTransID": "d7c1ee99-9478-44a6-b1f2-391e29c6b340",
        "acsReferenceNumber": "3DS_LOA_ACS_PPFU_020100_00009",
        "acsOperatorID": "AcsOpId 4138359541",
        "dsReferenceNumber": "DS_LOA_DIS_PPFU_020100_00010",
        "transStatus": "C",
        "acsRenderingType": {
            "acsInterface": "01",
            "acsUiTemplate": "02"
        },
        "acsSignedContent": "eyJhbGciOiJQUzI1NiIsIng1YyI6Ik1JSURlVENDQW1HZ0F3SUJBZ0lRYlM0QzRCU", //truncated for display purpose
        "authenticationType": "01",
        "acsChallengeMandated": "Y",
        "sdkTransID": "b2385523-a66c-4907-ac3c-91848e8c0067"
    }
}

// getter for Frictionless flow object
// APP

let getAppFrictionlessFlow = () => {
    return {
        "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
        "dsReferenceNumber": "DS_LOA_DIS_PPFU_020100_00010",
        "dsTransID": "f25084f0-5b16-4c0a-ae5d-b24808a95e4b",
        "messageVersion": "2.1.0",
        "sdkTransID": "b2385523-a66c-4907-ac3c-91848e8c0067",
        "messageType": "ARes",
        "transStatus": "Y",
        "acsOperatorID": "AcsOpId 4138359541",
        "acsReferenceNumber": "3DS_LOA_ACS_PPFU_020100_00009",
        "acsTransID": "d7c1ee99-9478-44a6-b1f2-391e29c6b340",
        "authenticationValue": "MTIzNDU2Nzg5MDA5ODc2NTQzMjE=",
        "eci": "05"
    }
}

// getter for BRW Challenge flow
// BRW

let getBRWChallengeFlow = () => {
    return {
        "messageVersion": "2.1.0",
        "dsTransID": "f25084f0-5b16-4c0a-ae5d-b24808a95e4b",
        "messageType": "ARes",
        "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
        "acsTransID": "d7c1ee99-9478-44a6-b1f2-391e29c6b340",
        "acsReferenceNumber": "3DS_LOA_ACS_PPFU_020100_00009",
        "acsOperatorID": "AcsOpId 4138359541",
        "dsReferenceNumber": "DS_LOA_DIS_PPFU_020100_00010",
        "transStatus": "C",
        "acsChallengeMandated": "Y",
        "acsURL": "http://localhost:4242/acs/providechallenge",
        "authenticationType": "01"
    }
}

module.exports = {
    getAppChallengeFlowObject,
    getAppFrictionlessFlow,
    getBRWChallengeFlow
}