let express = require('express')
let path = require('path')
let moment = require('moment')
let nocache = require('nocache')
let fs = require('fs')
var secureRandom = require('secure-random')

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
