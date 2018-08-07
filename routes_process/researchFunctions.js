//
//      Return the client matching the given ID from clients params
//

let getUserByThreeDSTransID = (threeDSServerTransID, clients) => {
    for (let i = 0; i < clients.length; i++) {
        console.log(clients[i]);
        if (clients[i].threeDSServerTransID === threeDSServerTransID) {
            return clients[i]
        }
    }
    return null
}

let getUserByTransID = (transID, clients) => {

    for (let i = 0; i < clients.length; i++) {
        console.log(clients[i]);
        if (clients[i].aRes.acsTransID === transID) {
            return clients[i]
        }
    }
    return null
}

module.exports = {
    getUserByThreeDSTransID,
    getUserByTransID,
}