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

## Routes detail

### Merchant (/route/merchant.js)
