'use strict'

import test from 'ava'
import Message from '../src/lib/message'
import Tray from '../src/lib/tray'
import uuid from 'uuid-base62'
import Config from 'getfig'
import delay from 'delay'

const mailgunConfig = Config.get('providers.mailgun')
const domain = mailgunConfig.domain

let email = `${uuid.v4()}@${domain}`.toLowerCase()

test.beforeEach(async t => {
  const tray = await Tray.add({
    email
  })

  t.context.tray = tray

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
  const tray = new Tray(t.context.tray.id)
  await tray.remove()
})

test('Get message Data', async t => {
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

test('Get all Messages by tray', async t => {
  const message = await Message.send(t.context.messageData)
  const message2 = await Message.send(t.context.messageData)

  const messages = await Message.getAll({
    tray: t.context.tray.id
  })

  const rm = await Promise.all(messages.map(async m => {
    const message = new Message(m.id)
    await message.remove()
    return m.id
  }))

  t.is(true, true)
  t.is((messages.length > 1), true)
  t.is((rm.indexOf(message.id) >= 0), true)
  t.is((rm.indexOf(message2.id) >= 0), true)
})

test('Get all Messages', async t => {
  const message = await Message.send(t.context.messageData)
  const message2 = await Message.send(t.context.messageData)

  const messages = await Message.getAll()

  const rm = await Promise.all(messages.map(async m => {
    const message = new Message(m.id)
    await message.remove()
    return m.id
  }))

  t.is((messages.length > 1), true)
  t.is((rm.indexOf(message.id) >= 0), true)
  t.is((rm.indexOf(message2.id) >= 0), true)
})

test('Async Message', async t => {
  const newMsg = await Message.send(t.context.messageData)

  await delay(5000)

  const message = new Message(newMsg.id)
  const messaData = await message.get()
  const asyncData = await message.asyncProvider()

  t.deepEqual(messaData.id, newMsg.id)
  t.is(typeof asyncData['body-html'], 'string')
})
