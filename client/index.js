let express = require('express')
let path = require('path')
let bwMonitor = require('../lib/BandwidthMonitor')
let superagent = require('superagent')

let app = express()

app.get('/request', (req, res) => {
    let ServerIP = req.param('ip')
    let ServerPort = req.param('port')
    let RequestN = req.param('n')
    let Timeout = req.param('timeout')
    let DataSize = req.param('size')

    let agent = superagent.agent()
    let dataRequests = []
    let requestLog = []

    for (let i = 0; i < RequestN; i++) {
        requestLog.push({
            start: -1,
            end: -1
        })

        dataRequests.push(
            agent
                .get(`http://${ServerIP}:${ServerPort}/data`)
                .query({ size: DataSize })
                .buffer(true)
                .timeout({
                    deadline: Timeout,
                })
                .then(() => {
                    requestLog[i].end = new Date()
                })
        )
    }

    startTime = new Date()
    for (let i = 0; i < RequestN; i++) {
        requestLog[i].start = startTime
    }
    Promise
        .all(dataRequests)
        .then(() => {
            res.json({
                log: requestLog
            })
        })
        .catch((err) => {
            console.error(err)
            res.json({
                log: requestLog,
                error: err
            })
        })
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

app.listen('7070', (err) => {
    if (err)
        throw(err)
    console.log('Client is listening on port 7070')
})
