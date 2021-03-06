let request = require('superagent')
let fs = require('fs')

let serverIP = '192.168.1.123'
let serverPort = '8080'
let clientIP = ['192.168.1.124', '192.168.1.125','192.168.1.126']
let clientPort = '7070'

let main = async () => {
    await request
        .get(`http://${serverIP}:${serverPort}/bandwidth`)
        .query({ action: 'start' })

    for (let i = 0; i < clientIP.length; i++) {
        await request
            .get(`http://${clientIP[i]}:${clientPort}/bandwidth`)
            .query({ action: 'start' })
    }

    let reqs = []
    let results = []
    for (let i = 0; i < clientIP.length; i++) {
        reqs.push(
            request
            .get(`http://${clientIP[i]}:${clientPort}/request`)
            .query({ ip: serverIP })
            .query({ port: serverPort })
            .query({ n: 3 })   // number of requests
            .query({ timeout: 20000 })  // deadline of each request (ms)
            .query({ size: 1024*1024*5 }) // request data size (byte)
            .then((result) => {
                results.push(result)
            })
        )
    }

    await Promise.all(reqs)

    for (let i = 0; i < clientIP.length; i++) {
        fs.writeFileSync(`../log/result-${i+1}.json`, JSON.stringify(results[i].body, null, 4))
    }

    for (let i = 0; i < clientIP.length; i++) {
        let log = await request
            .get(`http://${clientIP[i]}:${clientPort}/bandwidth`)
            .query({ action: 'log' })
        fs.writeFileSync(`../log/bw-${i+1}.json`, JSON.stringify(log.body, null, 4))
    }

    for (let i = 0; i < clientIP.length; i++) {
        await request
            .get(`http://${clientIP[i]}:${clientPort}/bandwidth`)
            .query({ action: 'stop' })
        await request
            .get(`http://${clientIP[i]}:${clientPort}/bandwidth`)
            .query({ action: 'reset' })
    }

    let serverBW = await request
        .get(`http://${serverIP}:${serverPort}/bandwidth`)
        .query({ action: 'log' })
    fs.writeFileSync(`../log/bw-server.json`, JSON.stringify(serverBW.body, null, 4))
    await request
        .get(`http://${serverIP}:${serverPort}/bandwidth`)
        .query({ action: 'stop' })
    await request
        .get(`http://${serverIP}:${serverPort}/bandwidth`)
        .query({ action: 'reset' })
}

try {
    main()
} catch(err) {
    console.log(err)
}
