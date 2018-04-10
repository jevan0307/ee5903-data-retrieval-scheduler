let superagent = require('superagent')
let delay = require('await-delay')
let Throttle = require('superagent-throttle')
let { exec } = require('child_process')

// let bandwidthMonitor = setInterval(() => {
//     exec('ifconfig enp0s3', (err, stdout, stderr) => {
//         if (err) {
//             console.error(err)
//             process.exit(-1)
//         }
//         let RXBytes = stdout.match(/RX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
//         let TXBytes = stdout.match(/TX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
//         console.log(parseInt(RXBytes)/1024/1024, parseInt(TXBytes)/1024/1024)
//     })
// }, 1000)

let request = superagent.agent()

let ip = '172.18.0.2'
let port = '8000'

Promise.all([
    request
        .get(`http://${ip}:${port}/`)
        .then(() => {
            console.log(1+'finish')
        }),
    request
        .get(`http://${ip}:${port}/`)
        .then(() => {
            console.log(2+'finish')
        }),
    request
        .get(`http://${ip}:${port}/`)
        .then(() => {
            console.log(3+'finish')
        }),
    request
        .get(`http://${ip}:${port}/`)
        .then(() => {
            console.log(4+'finish')
        }),
    request
        .get(`http://${ip}:${port}/`)
        .then(() => {
            console.log(5+'finish')
        })
]).then(() => {
    // clearInterval(bandwidthMonitor)
})
