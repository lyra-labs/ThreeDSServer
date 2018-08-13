# ThreeDSProtocole PoC technical documentation

## How to launch the server

You need to have nodeJS and npm/yarn installed.
Steps:

* `git clone https://github.com/lyra-labs/ThreeDSServer.git`
* `cd ThreeDSServer`
* `npm install` or `yarn install`
* `node app`

The server is now running on localhost:4242

## Intro

This server works in collaboration with the [WebAuthPay](https://github.com/lyra-labs/WebAuthPay) repository, you'll need to have both server launched to use it. Refer to WebauthPay readme to use it.

Server components:

* Merchant Server
* ThreeDSServer
* Director Server (DS)
* Access Control Server (ACS)

WebAuthPay has the client side located on /static/threeds

//
//  Penser à expliquer comment on gère le Preq/Pres. Placer les explications avant le client
//
// détailler les réponses différentes des mocks dans des samples JSON
//

## Routes detail

### Client (WebAuthPay)

file : (threeDSMethod.js)

After filling the form, the submit button calls `getThreeDSMethod_URL()` that will lauch the 3ds method flow. It send the credit card number to the merchant.

Response is:

 ```javacript
{
    status: "",
    threeDSServerTransID: "",
    threeDSMethodURL: "",
    notificationMethodURL: ""
}
```

Next call is `getIframeContent`, it calls the ACS threeDSMethodURL and take back the content of the 3DS method HTML file. The Iframe is then loaded.

file : (threedsController.js)

The page wait until the `receiveMessage(event)` (with event.data.messageType != 'CRes') funtion is called by the hidden iframe, it will then calls `startAuthentication()`  and lauch the 3DS 2.0 flow by calling the /merchant/pay route with payment informations.

The response tell if the Ares request a challenge or not, if it does the `sendcReq` funtion is called. It receive the HTML of the challenge Iframe as response and spawn it using `savedIframe = $.featherlight(response, defaults)`.
The savedIframe variable is kept to close the Iframe later.

Same method as the 3DS method for the closing of the Iframe, the Iframe HTML will call `receiveMessage(event)` (with event.data.messageType == 'CRes'), it will then call the notificationURL and close the Iframe.

### Merchant (/route/merchant.js)

The /pay route, defined by `router.post('/pay', (request, response)`:

It handles the initial payment call from the client, check if all data are present and call the 3DSServer with the form datas to initiate the transaction.

The /notification route, defined by `router.post('/notification', (request, response)` is the very end of the protocole, it takes Cres as post parameter (sent by the client) and just return OK.

The /init route, defined by `router.post('/init', (request, response)` is called by the client during the 3DS Method process. It call the 3DS Server to get the 3DS Method information needed by the client and return them.

### ThreeDSServer (/route/threeDSServer.js)

 The /starttransaction route, defined by `router.post('/starttransaction', (request, response)` is called by the merchant with payment informations as parameters. It will first use the payment data to update an Areq mocked message using `getUpdatedAreq`, it will then set threeDSCompInd property to Y if the user has proceed a 3DS Method and start the authentication sending Areq to the DS. The response of the DS will be proceed and push back to the merchant.

 The /result route, defined by `router.post('/result', (request, response)` is called by the DS with a RREq as post parameter, it has to check the transStatus property and set the resultsStatus property of the RRes in function before sending it back to the DS.
 It is the last call of the 3DS server for a client so it will remove the client from his clients list after processing.


The /notificationMethod route, defined by `router.post('/notificationMethod', (request, response)` take confirmation of the 3DS Method completion and set a completion boolean in the user profil. This boolean is used in /starttransaction to set threeDSCompInd to Y or U.
It just respond OK to let the payment flow continue.

the /getmethod route defined by `router.post('/getmethod', (request, response)` 