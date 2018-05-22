'use strict'

// import * as firebase from 'firebase-admin'
import Message from './message.js'
import Event from './event.js'

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
