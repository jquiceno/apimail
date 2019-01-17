'use strict'

import test from 'ava'
import Message from '../src/lib/message'
import Tray from '../src/lib/tray'
import uuid from 'uuid-base62'
import Config from 'getfig'
import Template from '../src/lib/template'

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

test('Send new Message using render vars', async t => {
  const data = t.context.messageData

  data.html = '<h1>Hola querido {{name}}</h1>'

  const name = 'Juan Quiceno'

  data.vars = {
    name
  }

  const message = await Message.send(data)

  t.is(message.html.indexOf(data.vars.name) > -1, true)
})

test.afterEach(async t => {
  if (t.context.tray) {
    const tray = new Tray(t.context.tray.id)
    await tray.remove()
  }

  if (t.context.template) {
    const template = new Template(t.context.template.id)
    await template.remove()
  }
})

test('Send new Message', async t => {
  const data = t.context.messageData
  const message = await Message.send(data)

  const m = new Message(message.id)
  const messageData = await m.get()

  const rm = await m.remove()

  t.deepEqual(rm.id, message.id)
  t.deepEqual(messageData.subject, data.subject)
  t.deepEqual(messageData.tray, data.tray)
  t.deepEqual(messageData.to, data.to)
})

test('Send new Message using template', async t => {
  const newTemplateData = t.context.template
  const data = t.context.messageData

  const template = new Template(newTemplateData.id)

  data.template = {
    id: template.id
  }

  const message = await Message.send(data)

  t.deepEqual(message.subject, newTemplateData.subject)
})
