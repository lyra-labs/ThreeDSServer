//
//      Return the client matching the given ID from clients params
//

let getUserByThreeDSTransID = (threeDSServerTransID, clients) => {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].threeDSServerTransID === threeDSServerTransID) {
            return clients[i]
        }
    }
    return null
}

// je sais c'est dégueux
let getUserByTransID = (transID, clients) => {

    for (let i = 0; i < clients.length; i++) {
        if (clients[i].aRes.acsTransID === transID) {
            return clients[i]
        }
    }
    return null
}

let getUserWithoutAresByTransID = (transID, clients) => {

    for (let i = 0; i < clients.length; i++) {
        if (clients[i].acsTransID === transID) {
            return clients[i]
        }
    }
    return null
}

module.exports = {
    getUserByThreeDSTransID,
    getUserByTransID,
    getUserWithoutAresByTransID,
}