//
//  Generic here, should be different and specific in all different servers
//


let data = {
    threeDSVersion = "2.1.0",
    isCardRanges = false,
    isVersionMatching = false
}

let checkThreeDSVersion = (version) => {
    data.isVersionMatching = version === data.version
    return data.isVersionMatching
}

module.exports = {
    data,
    checkThreeDSVersion
}
