'use strict'

const http = require('http')
const exphbs = require('express-handlebars')
const express = require('express')
const env = require('env-var')
const probe = require('kube-probe')
const { join } = require('path')
const wss = require('./ws')
const log = require('./log')

const PORT = env.get('PORT', 8080).asPortNumber()
const WS_CONNECTION_STRING = env.get('WS_CONNECTION_STRING').required().asUrlString()

// Create an express app, attach it to a http server,
// and bind a websocket server to the same socket
const app = express()
const server = http.createServer(app)
wss(server)

// Kubernetes liveness readiness probes
probe(app)

app.engine('handlebars', exphbs())

app.set('views', join(__dirname, '/views'))
app.set('view engine', 'handlebars')

log.info(app.get('views'), join(__dirname, '/views'))
app.get('/', (req, res) => {
  res.render('home.handlebars', {
    WS_CONNECTION_STRING
  })
})

app.use('/static', express.static(join(__dirname, '../static')))

server.listen(PORT, (err) => {
  if (err) {
    throw err
  }

  log.info(`application started on port ${PORT}`)
})