let express = require('express')
let path = require('path')
let nocache = require('nocache')
let secureRandom = require('secure-random')
let bwMonitor = require('../lib/BandwidthMonitor')
let config = require('../config')

app = express()

app.use(nocache())

let scheduler = {
    requests: [],
    calcLambda: function (k, T0) {
        let n = 0
        for (let i = 0; i <= k; i++) {
            n += Math.sqrt(this.requests[i].pri)
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
        if (this.requests.length > 0) {
            let k = config.server.scheduler
            let T0 = config.server.scheduler.T0

            if (k && k != -1) {
                k = this.requests.length - 1
                while (this.requests[k].pri < this.calcLambda(k, T0)) {
                    k = k - 1
                }
            }

            console.log(`Number of requests in queue: ${this.requests.length}`)
            console.log(`Optimal Kth: ${k + 1}`)
            this.requests.forEach((req, i) => {
                if (i <= k) {
                    req.res.send(req.data)
                } else {
                    req.res.send({ error: 'Request is rejected' })
                }
            })
            this.requests.splice(0, this.requests.length)
            console.log('Clear queue and Start sending')
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
