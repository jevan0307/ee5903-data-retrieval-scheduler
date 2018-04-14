let { exec } = require('child_process')
let config = require('../config')

let monitor = null
let log = []

function start (interval) {
    if (monitor == null) {
        setInterval(() => {
            exec(`ifconfig ${config.NetworkInterface}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(err)
                    process.exit(-1)
                }
                let RXBytes = stdout.match(/RX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
                let TXBytes = stdout.match(/TX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
                log.push({
                    time: new Date(),
                    RX: parseInt(RXBytes)/1024/1024,
                    TX: parseInt(TXBytes)/1024/1024
                })
            })
        }, interval)
    }
}

function stop () {
    if (monitor) {
        clearInterval(monitor)
        clearInterval = null
    }
}

function reset () {
    log = []
}

module.exports = {
    start,
    reset,
    stop,
    log
}
