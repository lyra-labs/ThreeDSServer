
let testAreq = () => {
    fetch('/merchant/pay', {
        method: 'POST',
        credentials: 'none',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

        })
    })
}
module.exports()