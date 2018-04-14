let { exec } = require('child_process')
let config = require('../config')


module.exports = {
    monitor: null,
    _log: [],

    start: function (interval) {
        if (!this.monitor) {
            this.monitor = setInterval(() => {
                exec(`ifconfig ${config.NetworkInterface}`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                        process.exit(-1)
                    }
                    let RXBytes = stdout.match(/RX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
                    let TXBytes = stdout.match(/TX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
                    this._log.push({
                        time: new Date(),
                        RX: parseInt(RXBytes)/1024/1024,
                        TX: parseInt(TXBytes)/1024/1024
                    })
                    console.log(new Date(), parseInt(RXBytes)/1024/1024, parseInt(TXBytes)/1024/1024)
                })
            }, interval)
        }
    },

    stop: function () {
        if (this.monitor) {
            clearInterval(this.monitor)
            this.monitor = null
        }
    },

    reset: function () {
        this._log.splice(0, this._log.length)
    },

    log: function () {
        return this._log
    }
}
