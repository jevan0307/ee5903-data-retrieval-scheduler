let fs = require('fs')
let path = require('path')

let files = []

let filenames = ['bw-1', 'bw-2', 'bw-3', 'bw-server']
let dirs = ['../log', '../log-T0-5', '../log-T0-12', '../log-T0-20']

filenames.forEach((f) => {
    dirs.forEach((d) => {
        files.push({
            name: f,
            dir: d
        })
    })
})

files.forEach((f) => {
    let p = path.join(f.dir, f.name + '.json')
    let json = require(p)
    let CSVtext = ''

    CSVtext += 'Time,RX,TX\n'
    for (let i in json.log) {
        if (i == 0) continue
        CSVtext += `${json.log[i].time},${json.log[i].RX-json.log[i-1].RX},${json.log[i].TX-json.log[i-1].TX}\n`
    }
    json.log.forEach((row, i) => {
        if (i == 0) return

    })
    fs.writeFileSync(path.join(f.dir, f.name + '.csv'), CSVtext)
})
