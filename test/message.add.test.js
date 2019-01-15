'use strict'

import test from 'ava'
import Message from '../src/lib/message'
import Tray from '../src/lib/tray'
import uuid from 'uuid-base62'
import Config from 'getfig'

const mailgunConfig = Config.get('providers.mailgun')
const domain = mailgunConfig.domain

let data = null
let trayId = null
let email = `${uuid.v4()}@${domain}`.toLowerCase()

test.before(async t => {
  const tray = await Tray.add({
    email
  })

  trayId = tray.id

  data = {
    from: `Test message`,
    to: 'loncuster@gmail.com',
    subject: 'Hello, test message by Pimail',
    html: '<p>Testing some Pmail awesomeness! <a href="https://google.com">Google.com</a></p>',
    tray: trayId,
    'o:testmode': true
  }
})

test.after(async t => {
  const tray = new Tray(trayId)
  await tray.remove()
})

test('Send new Message', async t => {
  const message = await Message.send(data)

  const m = new Message(message.id)
  const messageData = await m.get()

  const rm = await m.remove()

  t.deepEqual(rm.id, message.id)
  t.deepEqual(messageData.subject, data.subject)
  t.deepEqual(messageData.tray, data.tray)
  t.deepEqual(messageData.to, data.to)
})
