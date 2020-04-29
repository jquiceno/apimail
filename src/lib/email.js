'use strict'

// import * as firebase from 'firebase-admin'
const Message = require('./message.js')
const Event = require('./event.js')

class Email extends Message {
  constructor (id) {
    super(id)
    this.id = id
  }

  static async event (eventId = false) {
    return eventId ? new Event(eventId) : Event
  }
}

module.exports = Email
