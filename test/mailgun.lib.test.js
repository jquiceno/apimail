'use strict'

import test from 'ava'
import uuid from 'uuid-base62'
import Mailgun from '../src/lib/mailgun'
import Config from 'getfig'

const mailgunConfig = Config.get('providers.mailgun')
const domain = mailgunConfig.domain

let messageId = null
let data = null

test.before('Send Message', async t => {
  data = {
    from: `Excited User <${uuid.v4()}@${domain}>`,
    to: 'loncuster@gmail.com',
    subject: 'Hello Message by Pimail',
    text: 'Testing some Mailgun awesomeness!'
  }

  const message = await Mailgun.send(data)

  messageId = message.id
  t.deepEqual(typeof message.id, 'string')
})

test('Get events', async t => {
  const id = messageId
  const mailgun = new Mailgun(id)

  let events = await mailgun.events()

  t.deepEqual(typeof events, 'object')
})

test('Get message data', async t => {
  const id = messageId
  const mailgun = new Mailgun(id)

  let messageData = await mailgun.info()

  t.is(typeof messageData, 'object')
  t.deepEqual(messageData['recipients'], data.to)
})
