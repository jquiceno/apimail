'use strict'

require('babel-register')
const server = require('./services/')
const Email = require('./lib/email.js')

module.exports = {
  email: Email,
  server: server
}
