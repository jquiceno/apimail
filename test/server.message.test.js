'use strict'

import test from 'ava'
import Message from '../src/lib/message'
import Tray from '../src/lib/tray'
import uuid from 'uuid-base62'
import Config from 'getfig'
import Template from '../src/lib/template'
import Server from '../src/services'
import request from 'request-promise'
import delay from 'delay'

const mailgunConfig = Config.get('providers.mailgun')
const domain = mailgunConfig.domain
let server = null

test.before(async t => {
  server = await Server.start('test')
})

test.beforeEach(async t => {
  t.context.server = server
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

test('Send new message', async t => {
  const data = t.context.messageData
  const server = t.context.server

  const res = await request({
    uri: `${server.uri}/messages`,
    method: 'POST',
    body: data,
    json: true
  })

  const message = res.data
  t.context.message = message

  t.deepEqual(message.to, data.to)
  t.is(typeof message.id, 'string')
  t.is(res.statusCode, 201)
})

test('Error: tray not found', async t => {
  const data = t.context.messageData
  const server = t.context.server

  delete data.tray

  const err = await t.throwsAsync(async () => {
    const res = await request({
      uri: `${server.uri}/messages`,
      method: 'POST',
      body: data,
      json: true
    })

    return res
  })

  t.is(err.error.statusCode, 400)
  t.regex(err.error.message, /Tray id not found or invalid/)
})

test('Get message by id', async t => {
  const data = t.context.messageData
  const server = t.context.server
  const message = await Message.send(data)

  const res = await request({
    uri: `${server.uri}/messages/${message.id}`,
    method: 'GET',
    json: true
  })

  t.context.message = message

  t.deepEqual(message.to, res.data.to)
  t.is(message.id, res.data.id)
  t.is(res.statusCode, 200)
})

test('Error: message not found', async t => {
  const server = t.context.server

  const err = await t.throwsAsync(async () => {
    const res = await request({
      uri: `${server.uri}/messages/${uuid.v4()}`,
      method: 'GET',
      json: true
    })

    return res
  })

  t.is(err.error.statusCode, 400)
  t.regex(err.error.message, /Message not found or invalid/)
})

test('Get all message events', async t => {
  const data = t.context.messageData
  const server = t.context.server
  let message = await Message.send(data)

  await delay(10000)

  const res = await request({
    uri: `${server.uri}/messages/${message.id}/events`,
    method: 'GET',
    json: true
  })

  message = new Message(message.id)
  const events = await message.event.getAll()

  for (let i in events) {
    await message.event.remove(events[i].id)
  }

  t.context.message = message

  t.deepEqual(res.data.length, events.length)
  t.deepEqual(res.data.filter(e => e.provider.id === events[0].provider.id).length, 1)
  t.is(res.statusCode, 200)
})
