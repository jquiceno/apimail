'use strict'

import test from 'ava'
import Message from '../src/lib/message'
import Tray from '../src/lib/tray'
import uuid from 'uuid-base62'
import Config from 'getfig'
import delay from 'delay'

const mailgunConfig = Config.get('providers.mailgun')
const domain = mailgunConfig.domain

test.beforeEach(async t => {
  const email = `${uuid.v4()}@${domain}`.toLowerCase()
  const tray = await Tray.add({
    email
  })

  t.context.tray = tray

  const message = await Message.send({
    from: `Test message`,
    to: 'loncuster@gmail.com',
    subject: 'Hello, test message by Pimail',
    html: '<p>Testing some Pmail awesomeness! <a href="https://google.com">Google.com</a></p>',
    tray: tray.id,
    'o:testmode': true
  })

  t.context.message = message

  t.context.eventData = {
    message: message.id,
    event: 'opened',
    test: 3245346456
  }
})

test.afterEach(async t => {
  if (t.context.message) {
    const m = new Message(t.context.message.id)
    await m.remove()
  }

  if (t.context.tray) {
    const tray = new Tray(t.context.tray.id)
    await tray.remove()
  }
})

test('Async events provider', async t => {
  const message = t.context.message

  const m = new Message(message.id)
  await delay(10000)
  const events = await m.event.asyncProvider()
  const events2 = await m.event.getAll()

  for (let i in events) {
    const e = events[i]
    await m.event.remove(e.id)
  }

  t.deepEqual(events.filter(e => e.provider.id === events2[0].provider.id).length, 1)
})

test('Add new message event', async t => {
  const message = t.context.message
  const newEventData = t.context.eventData

  const m = new Message(message.id)
  const eventData = await m.event.add(newEventData)
  await m.event.remove(eventData.id)

  t.deepEqual(eventData.message, newEventData.message)
  t.is(eventData.test, undefined)
})

test('Remove message event', async t => {
  const message = t.context.message
  const newEventData = t.context.eventData

  const m = new Message(message.id)
  const eventData = await m.event.add(newEventData)
  const rm = await m.event.remove(eventData.id)

  t.deepEqual(eventData.message, newEventData.message)
  t.is(eventData.test, undefined)
  t.deepEqual(rm.id, eventData.id)
  t.deepEqual(rm.message, eventData.message)
})

test('Get all events by message', async t => {
  const message = t.context.message
  const newEventData = t.context.eventData

  const m = new Message(message.id)
  const eventData = await m.event.add(newEventData)
  const events = await m.event.getAll()

  const q = events.filter(e => {
    return e.id === eventData.id
  })

  await m.event.remove(eventData.id)

  t.is((q.length > 0), true)
  t.is(q[0].id, eventData.id)
})
