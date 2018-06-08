// This example is an AReq message between the DS and the ACS. For the AReq message
// between the 3DS Server and the DS, the Device Information (deviceInfo) data element shall
// be replaced by its encrypted version the SDK Encrypted Data (sdkEncData).

//
//  no params at this time, may take some specification as parameter
//

// authentication messages

// APP

let getFirstARequest = () => {
    return {
        "threeDSRequestorID": "az0123456789",
        "threeDSRequestorName": "Example Requestor name",
        "threeDSRequestorURL": "https://threedsrequestor.adomainname.net",
        "acquirerBIN": "868491",
        "acquirerMerchantID": "mGm6AJZ1YotkJJmOk0fx",
        "addrMatch": "N",
        "cardExpiryDate": "1910",
        "acctNumber": "8944988785642183",
        "billAddrCity": "Bill City Name",
        "billAddrCountry": "840",
        "billAddrLine1": "Bill Address Line 1",
        "billAddrLine2": "Bill Address Line 2",
        "billAddrLine3": "Bill Address Line 3",
        "billAddrPostCode": "Bill Post Code",
        "billAddrState": "CO",
        "email": "example@example.com",
        "homePhone": {
            "cc": "123",
            "subscriber": "123456789"
        },
        "mobilePhone": {
            "cc": "123",
            "subscriber": "123456789"
        },
        "cardholderName": "Cardholder Name",
        "shipAddrCity": "Ship City Name",
        "shipAddrCountry": "840",
        "shipAddrLine1": "Ship Address Line 1",
        "shipAddrLine2": "Ship Address Line 2",
        "shipAddrLine3": "Ship Address Line 3",
        "shipAddrPostCode": "Ship Post Code",
        "shipAddrState": "CO",
        "workPhone": {
            "cc": "123",
            "subscriber": "123456789"
        },
        "deviceChannel": "01",
        "deviceRenderOptions": {
            "sdkInterface": "03",
            "sdkUiType": ["01", "02", "03", "04", "05"]
        },
        "mcc": "5411",
        "merchantCountryCode": "840",
        "merchantName": "UL TS BV",
        "messageCategory": "01",
        "messageType": "AReq",
        "messageVersion": "2.1.0",
        "purchaseAmount": "101",
        "purchaseCurrency": "978",
        "purchaseExponent": "2",
        "purchaseDate": "20170316141312",
        "sdkAppID": "dbd64fcb-c19a-4728-8849-e3d50bfdde39",
        "sdkMaxTimeout": "05",
        "sdkEphemPubKey": {
            "kty": "EC",
            "crv": "P-256",
            "x": "WWcpTjbOqiu_1aODllw5rYTq5oLXE_T0huCPjMIRbkI",
            "y": "Wz_7anIeadV8SJZUfr4drwjzuWoUbOsHp5GdRZBAAiw"
        },
        "sdkReferenceNumber": "3DS_LOA_SDK_PPFU_020100_00007",
        "sdkTransID": "b2385523-a66c-4907-ac3c-91848e8c0067",
        "transType": "01",
        "threeDSServerURL": "https://threedsserver.adomainname.net",
        "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
        "threeDSServerRefNumber": "3DS_LOA_SER_PPFU_020100_00008",
        "threeDSRequestorAuthenticationInd": "03",
        "threeDSRequestorAuthenticationInfo": {
            "threeDSReqAuthMethod": "02",
            "threeDSReqAuthTimestamp": "201711071307",
            "threeDSReqAuthData": "validlogin at UL TS BV"
        },
        "threeDSRequestorChallengeInd": "02",
        "threeDSRequestorPriorAuthenticationInfo": {
            "threeDSReqPriorRef": "d7c1ee99-9478-44a6-b1f2-391e29c6b340",
            "threeDSReqPriorAuthMethod": "02",
            "threeDSReqPriorAuthTimestamp": "201710282113",
            "threeDSReqPriorAuthData": "cKTYtrvvKU7gUoiqbbO7Po"
        },
        "threeDSServerOperatorID": "1jpeeLAWgGFgS1Ri9tX9",
        "acctType": "03",
        "acctInfo": {
            "chAccAgeInd": "03",
            "chAccDate": "20140328",
            "chAccChangeInd": "04",
            "chAccChange": "20160712",
            "chAccPwChangeInd": "02",
            "chAccPwChange": "20170328",
            "shipAddressUsageInd": "04",
            "shipAddressUsage": "20160714",
            "txnActivityDay": "1",
            "txnActivityYear": "21",
            "provisionAttemptsDay": "0",
            "nbPurchaseAccount": "11",
            "suspiciousAccActivity": "01",
            "shipNameIndicator": "02",
            "paymentAccInd": "04",
            "paymentAccAge": "20160917"
        },
        "acctID": "personal account",
        "dsReferenceNumber": "DS_LOA_DIS_PPFU_020100_00010",
        "dsTransID": "1jpe0dc0-i9t2-4067-bcb1-nmt866956sgd",
        "dsURL": "https://dsserver.domainname.com",
        "payTokenInd": true,
        "purchaseInstalData": "024",
        "merchantRiskIndicator": {
            "shipIndicator": "02",
            "deliveryTimeframe": "01",
            "deliveryEmailAddress": "deliver@email.com",
            "reorderItemsInd": "01",
            "preOrderPurchaseInd": "02",
            "preOrderDate": "20170519",
            "giftCardAmount": "337",
            "giftCardCurr": "840",
            "giftCardCount": "02"
        },
        "messageExtension": [{
            "name": "msgextname",
            "id": "501341592B_0001_4568",
            "criticalityIndicator": false,
            "data": {
                "valueOne": "messageextensiondata",
                "valueTwo": "moremessageextensiondata"
            }
        }],
        "recurringExpiry": "20180131",
        "recurringFrequency": "6",
        "broadInfo": { "message": "TLS 1.x will be turned off starting summer 2019" },
        "deviceInfo": "ew0KCSJEViI6ICIxLjAiLA0KCSJERCI6IHsNCgkJIkMwMDEiOiAiQW5kcm9pZCIsDQoJCSJDMDAyIjogIkhUQyBPbmVfTTgiLA0KCQkiQzAwNCI6ICI1LjAuMSIsDQoJCSJDMDA1IjogImVuX1VTIiwNCgkJIkMwMDYiOiAiRWFzdGVybiBTdGFuZGFyZCBUaW1lIiwNCgkJIkMwMDciOiAiMDY3OTc5MDMtZmI2MS00MWVkLTk0YzItNGQyYjc0ZTI3ZDE4IiwNCgkJIkMwMDkiOiAiSm9obidzIEFuZHJvaWQgRGV2aWNlIg0KCX0sDQoJIkRQTkEiOiB7DQoJCSJDMDEwIjogIlJFMDEiLA0KCQkiQzAxMSI6ICJSRTAzIg0KCX0sDQoJIlNXIjogWyJTVzAxIiwgIlNXMDQiXQ0KfQ0K"
    }

}


//
//  Areq 2, problably the delivery informations TODO check and identify it
//

// BRW

let getSecondARequest = () => {
    return {
        "threeDSCompInd": "Y",
        "threeDSRequestorID": "az0123456789",
        "threeDSRequestorName": "Example Requestor name",
        "threeDSRequestorURL": "https://threedsrequestor.adomainname.net",
        "acquirerBIN": "868491",
        "acquirerMerchantID": "mGm6AJZ1YotkJJmOk0fx",
        "addrMatch": "N",
        "cardExpiryDate": "1910",
        "acctNumber": "8944988785642183",
        "billAddrCity": "Bill City Name",
        "billAddrCountry": "840",
        "billAddrLine1": "Bill Address Line 1",
        "billAddrLine2": "Bill Address Line 2",
        "billAddrLine3": "Bill Address Line 3",
        "billAddrPostCode": "Bill Post Code",
        "billAddrState": "CO",
        "email": "example@example.com",
        "homePhone": {
            "cc": "123",
            "subscriber": "123456789"
        },
        "mobilePhone": {
            "cc": "123",
            "subscriber": "123456789"
        },
        "cardholderName": "Cardholder Name",
        "shipAddrCity": "Ship City Name",
        "shipAddrCountry": "840",
        "shipAddrLine1": "Ship Address Line 1",
        "shipAddrLine2": "Ship Address Line 2",
        "shipAddrLine3": "Ship Address Line 3",
        "shipAddrPostCode": "Ship Post Code",
        "shipAddrState": "CO",
        "workPhone": {
            "cc": "123",
            "subscriber": "123456789"
        },
        "deviceChannel": "02",
        "browserAcceptHeader": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "browserIP": "192.168.1.11",
        "browserJavaEnabled": true,
        "browserLanguage": "en",
        "browserColorDepth": "48",
        "browserScreenHeight": "400",
        "browserScreenWidth": "600",
        "browserTZ": "0",
        "browserUserAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0)Gecko/20100101 Firefox/47.0",
        "mcc": "5411",
        "merchantCountryCode": "840",
        "merchantName": "UL TS BV",
        "messageCategory": "01",
        "messageType": "AReq",
        "messageVersion": "2.1.0",
        "purchaseAmount": "101",
        "purchaseCurrency": "978",
        "purchaseExponent": "2",
        "purchaseDate": "20170316141312",
        "transType": "01",
        "threeDSServerURL": " https://threedsserver.adomainname.net ",
        "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
        "threeDSServerRefNumber": "3DS_LOA_SER_PPFU_020100_00008",
        "threeDSRequestorAuthenticationInd": "03",
        "threeDSRequestorAuthenticationInfo": {
            "threeDSReqAuthMethod": "02",
            "threeDSReqAuthTimestamp": "201711071307",
            "threeDSReqAuthData": "validlogin at UL TS BV"
        },
        "threeDSRequestorChallengeInd": "02",
        "threeDSRequestorPriorAuthenticationInfo": {
            "threeDSReqPriorRef": "d7c1ee99-9478-44a6-b1f2-391e29c6b340",
            "threeDSReqPriorAuthMethod": "02",
            "threeDSReqPriorAuthTimestamp": "201710282113",
            "threeDSReqPriorAuthData": "cKTYtrvvKU7gUoiqbbO7Po"
        },
        "threeDSServerOperatorID": "1jpeeLAWgGFgS1Ri9tX9",
        "acctType": "03",
        "acctInfo": {
            "chAccAgeInd": "03",
            "chAccDate": "20140328",
            "chAccChangeInd": "04",
            "chAccChange": "20160712",
            "chAccPwChangeInd": "02",
            "chAccPwChange": "20170328",
            "shipAddressUsageInd": "04",
            "shipAddressUsage": "20160714",
            "txnActivityDay": "1",
            "txnActivityYear": "21",
            "provisionAttemptsDay": "0",
            "nbPurchaseAccount": "11",
            "suspiciousAccActivity": "01",
            "shipNameIndicator": "02",
            "paymentAccInd": "04",
            "paymentAccAge": "20160917"
        },
        "acctID": "personal account",
        "dsReferenceNumber": "DS_LOA_DIS_PPFU_020100_00010",
        "dsTransID": "1jpe0dc0-i9t2-4067-bcb1-nmt866956sgd",
        "dsURL": "https://dsserver.domainname.com",
        "payTokenInd": true,
        "purchaseInstalData": "024",
        "merchantRiskIndicator": {
            "shipIndicator": "02",
            "deliveryTimeframe": "01",
            "deliveryEmailAdresse": "deliver@email.com",
            "reorderItemsInd": "01",
            "preOrderPurchaseInd": "02",
            "preOrderDate": "20170519",
            "giftCardAmount": "337",
            "giftCardCurr": "840",
            "giftCardCount": "02"
        },
        "messageExtension": [{
            "name": "msgextname",
            "id": "501341592B_0001_4567",
            "criticalityIndicator": false,
            "data": {
                "valueOne": "messageextensiondata",
                "valueTwo": "moremessageextensiondata"
            }
        }],
        "recurringExpiry": "20180131",
        "recurringFrequency": "6",
        "broadInfo": { "message": "TLS 1.x will be turned off starting summer 2019" }
    }
}

module.exports = {
    getFirstARequest,
    getSecondARequest
}