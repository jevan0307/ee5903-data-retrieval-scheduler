let request = require('superagent')
let fs = require('fs')

let serverIP = '192.168.1.123'
let serverPort = '8080'
let clientIP = ['192.168.1.124', '192.168.1.125','192.168.1.126']
let clientPort = '7070'

let main = async () => {
    await request
        .get(`http://${clientIP[0]}:${clientPort}/bandwidth`)
        .query({ action: 'start' })

    let data = await request
        .get(`http://${clientIP[0]}:${clientPort}/request`)
        .query({ ip: serverIP })
        .query({ port: serverPort })
        .query({ n: 3 })
        .query({ timeout: 20000 })
        .query({ size: 1024*1024*5 }) // 1MB
    console.log(JSON.parse(data.text))

    let log = await request
        .get(`http://${clientIP[0]}:${clientPort}/bandwidth`)
        .query({ action: 'log' })
    await request
        .get(`http://${clientIP[0]}:${clientPort}/bandwidth`)
        .query({ action: 'stop' })
    await request
        .get(`http://${clientIP[0]}:${clientPort}/bandwidth`)
        .query({ action: 'reset' })
    console.log(log.body)

    let bws = log.body.log
    for(let i = 1; i < bws.length; i++) {
        console.log(bws[i].RX-bws[i-1].RX, bws[i].TX-bws[i-1].TX)
    }
}

try {
    main()
} catch(err) {
    console.log(err)
}
