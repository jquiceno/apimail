'use strict'

import test from 'ava'
import Message from '../src/lib/message'
import Tray from '../src/lib/tray'
import uuid from 'uuid-base62'
import Config from 'getfig'
import Template from '../src/lib/template'
import { Callback } from '../src/lib/event'

const mailgunConfig = Config.get('providers.mailgun')
const domain = mailgunConfig.domain

test.beforeEach(async t => {
  const email = `${uuid.v4()}@${domain}`.toLowerCase()
  const tray = await Tray.add({
    email
  })

  t.context.tray = tray

  t.context.template = await Template.add({
    content: '<h1>Hola {{name}}</h1>',
    type: 'html',
    format: 'html',
    tray: tray.id,
    title: 'Test template',
    subject: 'Test message by template test',
    vars: {
      name: 'John Quiceno'
    }
  })

  t.context.messageData = {
    from: `Test message`,
    to: 'loncuster@gmail.com',
    subject: 'Hello, test message by Pimail',
    html: '<p>Testing some Pmail awesomeness! <a href="https://google.com">Google.com</a></p>',
    tray: tray.id,
    'o:testmode': true
  }
})

test.afterEach(async t => {
  if (t.context.tray) {
    const tray = new Tray(t.context.tray.id)
    await tray.remove
  }
  if (t.context.message) {
    const message = new Message(t.context.message.id)
    await message.remove
  }
})

test('Test event: message.send', async t => {
  const data = t.context.messageData

  Callback.add([{
    event: 'message.send',
    f: (messageData) => {
      t.deepEqual(messageData.to, data.to)
      t.is(typeof messageData.provider.id, 'string')
    }
  }])

  const message = await Message.send(data)
  t.context.message = message

  t.deepEqual(message.to, data.to)
  t.is(typeof message.id, 'string')
})

test('Test event: message.created', async t => {
  const data = t.context.messageData

  Callback.add([{
    event: 'message.created',
    f: (messageData) => {
      t.deepEqual(messageData.to, data.to)
      t.is(typeof messageData.id, 'string')
    }
  }])

  const message = await Message.send(data)
  t.context.message = message

  t.deepEqual(message.to, data.to)
  t.is(typeof message.id, 'string')
})
