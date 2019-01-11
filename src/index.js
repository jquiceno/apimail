import Event from './lib/event'
import Server from './services/'
import Email from './lib/email.js'

module.exports = {
  email: Email,
  server: Server,
  event: Event
}
