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

Master is the Testing branch. Once both servers are launched, you can access the frontend in localhost:9094.
The prod branch is only used for production (URL modified)

Server components:

* Merchant Server
* ThreeDSServer
* Director Server (DS)
* Access Control Server (ACS)

WebAuthPay has the client side located on /static/threeds

### Preq/Pres (3DSServer)

The Preq is then at the server start-up, it is initiated by the 3DS server and call the DS `router.post('/updatepres'; (request, response))`. The acs is then called to retrieve the 3dsMethodURL and everything is sent back and stored in the 3DSServer.

## Routes detail

### Client (WebAuthPay)

![3dsMethodFlow](https://github.com/lyra-labs/ThreeDSServer/blob/master/Doc/threeDSMethodUML.png)

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
It will then call `startAuthentication(response.threeDSServerTransID)` to create the pending request to will be used later for giving back the Ares next order to the client, it also pass here payment informations.
Next call is `getIframeContent`, it calls the ACS threeDSMethodURL and take back the content of the 3DS method HTML file. The Iframe is then loaded.
After the Iframe has finished, the acs will use the 3dsMethodNotificationURl to notify the 3DSServer that will start the Areq/Ares flow using the pending request post parameter data.
The reponse will come as a response of the pending request sent in startAuthentication. 

file : (threedsController.js)

![3dsMethodFlow](https://github.com/lyra-labs/ThreeDSServer/blob/master/Doc/DiagrammeSequenceChallenge.png)

The response tell if the Ares request a challenge or not, if it does the `sendcReq` funtion is called with the acsURL and IDs as paramaters. It receives the HTML of the challenge Iframe as response and spawn it using `savedIframe = $.featherlight(response, defaults)`.
If no challenge is required, a succes Iframe is loaded instead.
The savedIframe variable is kept to close the Iframe later.
In the response of the `sendcReq` function,  `sendConfirmationRequest()` is called, it will be used as a pending request to close the Iframe after the merchant notification method has been triggered by the acs.
Once the promise of `sendcReq` has loaded the Iframe, the ACS's iframe JS is doing everything by itself.

### Merchant (/route/merchant.js)

The /pay route, defined by `router.post('/pay', (request, response)`. It handles the initial payment call from the client, check if all data are present and call the 3DSServer with the form datas to initiate the transaction.

The /notification route, defined by `router.post('/notification', (request, response)` is the very end of the protocole, it takes Cres as post parameter (sent by the client) and just return OK.

The /init route, defined by `router.post('/init', (request, response)` is called by the client during the 3DS Method process. It call the 3DS Server to get the 3DS Method information needed by the client and return them.

The /requestConfirmation route, defined by `router.post('/requestConfirmation', (request, response)` is called by the client. The route will store the response object and associate it with the client ID. The response will be consumed after the /notification route is triggered to tell the client that he can close the challenge Iframe.

### ThreeDSServer (/route/threeDSServer.js)

The starttransaction function, defined by `let starttransaction(request)` is called by the '/notificationMethod' route (after the ACS confirm the 3DSMethod) with payment informations as parameters. It will first use the payment data to update an Areq mocked message using `getUpdatedAreq`, it will then set threeDSCompInd property to Y if the user has proceed a 3DS Method and start the authentication sending Areq to the DS. The response of the DS will be proceed and push back to the merchant.

The /result route, defined by `router.post('/result', (request, response)` is called by the DS with a RREq as post parameter, it has to check the transStatus property and set the resultsStatus property of the RRes in function before sending it back to the DS.
It is the last call of the 3DS server for a client so it will remove the client from his clients list after processing.

The /notificationMethod route, defined by `router.post('/notificationMethod', (request, response)` take confirmation of the 3DS Method completion and set a completion boolean in the user profil. This boolean is used in starttransaction() to set threeDSCompInd to Y or U.
It will then call startTransaction to start the Areq/Ares flow.

The /getmethod route defined by `router.post('/getmethod', (request, response)` will take the payment informations as POST parameter, create the client 3DSServerID and associate the data with it. It will then use the card number to select the good threeDSMethodURL and return the 3DSMethodURL, the 3DSMethodNotificationURL and the threeDSServerID to the browser.

The /waitMethod is used to store the pending request and to take additional payment informations. The response object is stored in the user profil. The user profil will then
be selected using the threeDSTransID in the /notificationMethod route.

### DS (/route/ds.js)

The /updatepres route defined by `router.post('/getmethod', (request, response)` takes a Preq as request parameter. It will fetch the ThreeDSMethodURL from this acs, update the Pres and return the Pres updated to the 3DS Server.

The /authrequest route defined by `router.post('/authrequest', (request, response)` takes an Areq as request parameter. It just transfert the Areq to the ACS and send the response (ARes) back to the 3DS server.

The /resulthandler route defined by `router.post('/resulthandler', (request, response)` takes an RREq as request parameter. It transfert The RReq to the 3DS Server and send the 3DS Server response back to the ACS.

### ACS (/route/acs.js)

The /getmethodurl route defined by `router.post('/getmethodurl', (request, response)` is just route that return the threeDSMethod URL to the DS.

The /handleMethodInfo route defined by `router.post('/handleMethodInfo', (request, response)` handles the 3DS method browser informations, store it and push a request with a status
and an ID to the threeDSMethodNotificationURL. It will then respond ok or ko to the hidden Iframe.

The /getMethodHTML route defined by `router.post('/getMethodHTML', (request, response)` will adapt the HTML with the 3DS Trans ID and the Notification Method URL corresponding to the client and send back the HTML of the hidden Iframe as text to the browser.

The /challengeresult route defined by `router.post('/challengeresult', (request, response)` takes as request parameter the challenge entries of the user. It will verify them, start
the RReq / RREs flow by sending an RReq to the DS and after the RRes is received, it will clear the client datas and send the Cres to the Challenge Iframe.

The /providechallenge route defined by `router.post('/providechallenge', (request, response)` route will modify the HTML challenge to add the user acsTransID and threeDSServerTransID and respond the html challenge page as text that will be loaded by the client.

The /authrequest route defined by `router.post('/authrequest', (request, response)` will take an Areq as request parameter, it will use the methodHash and the user's information to decide if a challenge is required or not. It will then populate the ARes and send it to the DS.