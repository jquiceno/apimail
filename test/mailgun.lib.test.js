'use strict'

import test from 'ava'
import uuid from 'uuid-base62'
import Mailgun from '../src/lib/mailgun'
import Config from 'getfig'

const mailgunConfig = Config.get('providers.mailgun')
const domain = mailgunConfig.domain

test.beforeEach('Send Message', async t => {
  const data = {
    from: `Excited User <${uuid.v4()}@${domain}>`,
    to: 'loncuster@gmail.com',
    subject: 'Hello Message by Pimail',
    text: 'Testing some Mailgun awesomeness!',
    'o:testmode': true
  }

  const message = await Mailgun.send(data)

  t.context.message = message.id
  t.context.data = data
  t.deepEqual(typeof message.id, 'string')
})

test('Get events', async t => {
  const id = t.context.message
  const mailgun = new Mailgun(id)

  let events = await mailgun.events()

  t.deepEqual(typeof events, 'object')
})

test('Get message data', async t => {
  const id = t.context.message
  const data = t.context.data
  const mailgun = new Mailgun(id)

  let messageData = await mailgun.info()

  t.is(typeof messageData, 'object')
  t.deepEqual(messageData['recipients'], data.to)
})
