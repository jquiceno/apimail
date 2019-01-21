'use strict'

module.exports = {
  message: {
    type: 'string',
    required: true
  },
  event: {
    type: 'string',
    required: true
  },
  city: {
    type: 'string'
  },
  recipient: {
    type: 'string'
  },
  region: {
    type: 'string'
  },
  ip: {
    type: 'string'
  },
  domain: {
    type: 'string'
  },
  country: {
    type: 'string'
  },
  'user-agent': {
    type: 'string'
  },
  _created: {
    type: 'number'
  },
  device: {
    type: 'object'
  },
  client: {
    type: 'object'
  }
}
