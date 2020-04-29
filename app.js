'use strict'

const server = require('./server')
const debug = require('debug')('server:info')

async function init () {
  await server.start()
  debug(`Server start in port: ${server.info.port}`)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
