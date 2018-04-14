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
    calcLambda: function (k, o, T0) {
        let n = 0
        for (let i = 0; i <= k; i++) {
            n += Math.sqrt(this.request[i].pri)
        }
        return Math.pow(n/(T0+k+1), 2)
    },
    maxPrice: function() {
        return this.requests[0].pri
    },
    pop: function () {
        return this.requests.splice(0, 1)[0]
    },
    push: function (res, pri, data) {
        this.requests.push({
            res: res,
            pri: pri,
            data: data
        })
        this.requests.sort((a, b) => b.pri - a.pri)
    },
    send: function() {
        if (!this.isSending && this.requests.length > 0) {
            let k = this.requests.length - 1

            while (this.requests[k].pri < calcLambda(k, T0)) {
                k = k - 1
            }

            this.isSending = true
            this.requests.forEach((req, i) => {
                if (i <= k) {
                    req.res.send(req.data)
                }
            })
            this.requests.splice(0, this.requests.length)
            console.log('Sending')
        }
    }
}

app.get('/data', (req, res) => {
    let dataSize = req.param('size')
    let pri = req.param('price') || 0

    let data = secureRandom.randomBuffer(parseInt(dataSize))
    scheduler.push(res, pri, data)
    setTimeout(() => {
        scheduler.send()
    }, 1000)
})

app.get('/data/finish', (req, res) => {
    scheduler.isSending = false
    scheduler.send()
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

app.listen('8080', () => {
    console.log('Server is listening on port 8080')
})
