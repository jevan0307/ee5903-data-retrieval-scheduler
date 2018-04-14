let express = require('express')
let path = require('path')
let nocache = require('nocache')
let secureRandom = require('secure-random')
let bwMonitor = require('../lib/BandwidthMonitor')

app = express()

app.use(nocache())

let scheduler = {
    isSending: false,
    requests: [],
    pop: function () {
        this.requests.sort((a, b) => b.pri - a.pri)
        return this.requests.splice(0, 1)
    },
    insert: function (res, pri, data) {
        this.requests.push({
            res: res,
            pri: pri,
            data: data
        })
    },
    send: function () {
        if (this.requests.length > 0　&& !this.isSending) {
            this.isSending = true
            let req = this.pop()
            req.res.send(req.data)
            this.isSending = false
            this.send()
        }
    }
}

app.get('/data', (req, res) => {
    let dataSize = req.param('size')
    let pri = req.param('price') || 0

    let data = secureRandom.randomBuffer(parseInt(dataSize))

    scheduler.push(res, pri, data)
    scheduler.send()
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

app.listen('8080', () => {
    console.log('Server is listening on port 8080')
})
