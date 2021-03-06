let express = require('express')
let path = require('path')
let nocache = require('nocache')
let secureRandom = require('secure-random')
let bwMonitor = require('../lib/BandwidthMonitor')
let config = require('../config')

app = express()

app.use(nocache())

app.get('/data', (req, res) => {
    let dataSize = req.param('size')

    let data = secureRandom.randomBuffer(parseInt(dataSize))
    res.send(data)
})

app.get('/data/finish', (req, res) => {
    res.json({ success: true })
})

app.get('/bandwidth', (req, res) => {
    let Action = req.param('action')
    let Interval = req.param('inverval') || 1000

    if (Action === 'start') {
        bwMonitor.start(Interval)
        res.json({ success: true })
    } else if (Action === 'stop') {
        bwMonitor.stop()
        res.json({ success: true })
    } else if (Action === 'reset') {
        bwMonitor.reset()
        res.json({ success: true })
    } else if (Action === 'log') {
        res.json({
            log: bwMonitor.log()
        })
    } else {
        res.json({
            error: 'Invalid parameter'
        })
    }
})

app.get('/alive', (req, res) => {
    res.json({ alive: true })
})

app.listen(config.server.port, (err) => {
    if (err) {
        console.log(err)
    }
    console.log(`Server is listening on port ${config.server.port}`)
})
