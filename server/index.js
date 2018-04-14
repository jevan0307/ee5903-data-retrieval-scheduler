let express = require('express')
let path = require('path')
let nocache = require('nocache')
let secureRandom = require('secure-random')
let bwMonitor = require('../lib/bandwidthMonitor')

app = express()

app.use(nocache())

app.get('/data', (req, res) => {
    let dataSize = req.param('size')

    let data = secureRandom.randomBuffer(dataSize)
    res.send(data)
})

app.get('/bandwidth', (req, res) => {
    let Action = req.param('action')
    let Interval = req.param('inverval') || 1000

    if (Action === 'start') {
        bwMonitor.start(Interval)
        res.send({ success: true })
    } else if (Action === 'stop') {
        bwMonitor.stop()
        res.send({ success: true })
    } else if (Action === 'reset') {
        bwMonitor.reset()
        res.send({ success: true })
    } else if (Action === 'log') {
        res.send({
            log: bwMonitor.log
        })
    } else {
        res.send({
            error: 'Invalid parameter'
        })
    }
})

app.get('/ping', (req, res) => {
    res.send({ alive: true })
})

app.listen('8000', () => {
    console.log('Server is listening on port 8080')
})
