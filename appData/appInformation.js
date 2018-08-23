const validator = require('validator')


//  Generic here, should be different and specific in all different servers
let baseUrl = "http://localhost:9095"
let prodUrl = "https://threedsserver-demo.lyra-labs.fr"

let data = {
    'threeDSVersion' : '2.1.0',
    'isCardRanges' : false,
    'isVersionMatching' : false
}

let checkThreeDSVersion = (version) => {
    return data.isVersionMatching = version === data.threeDSVersion
}

module.exports = {
    data,
    checkThreeDSVersion,
    baseUrl
}
