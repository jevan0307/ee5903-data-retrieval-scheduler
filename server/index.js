let express = require('express')
let path = require('path')
let moment = require('moment')
let nocache = require('nocache')
let fs = require('fs')
var secureRandom = require('secure-random')

let bandwidthMonitor = setInterval(() => {
    exec('ifconfig eth0', (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            process.exit(-1)
        }
        let RXBytes = stdout.match(/RX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
        let TXBytes = stdout.match(/TX bytes:(\d*) \(\d*.\d* [A-Z]*\)/i)[1]
        console.log(parseInt(RXBytes)/1024/1024, parseInt(TXBytes)/1024/1024)
    })
}, 1000)

app = express()

app.use(nocache())
app.use(express.static('public'))

var data = secureRandom.randomBuffer(1024*1024*10)

app.get('/', (req, res) => {
    console.log('Get req:', moment().format())
    res.send(data)
})

app.listen('8000', () => {
    console.log('Server listening on port 8000')
})
