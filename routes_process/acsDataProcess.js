// check client side challenge result

let isChallengeCompleted = (request, client) => {

    console.log(JSON.stringify(request.body));

    //
    //  Out of PoC scope but takes client to check results
    //

    if (!request || !request.body || !request.body.sms ||
        !request.body.password || !request.body.email) {
        return {
            'status': 'ko',
            'message': 'Missing one or more fields in the request'
        }
    }
    return { 'status': 'ok' }
}

let checkUserData = (userData) => {
    return false
}

let useMethodHashTheWayYouWant = (clientHash) => {
    return true
}

module.exports = {
    isChallengeCompleted,
    checkUserData,
    useMethodHashTheWayYouWant,
}