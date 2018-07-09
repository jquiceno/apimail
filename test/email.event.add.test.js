'use strict'

import test from 'ava'
import Email from '../src/lib/email.js'
import uuid from 'uuid-base62'
import fixtures from './fixtures'
import config from '../src/config'
import Server from '../src/services'
import request from 'request-promise'

const domain = config.providers.mailgun.domain

let server = null

test.before(async t => {
  server = await Server.start('test')
})

test('Add new event', async t => {
  const newEmail = await Email.send(fixtures.getEmailData(), domain)
  const email = new Email(newEmail.ID)
  const messageData = await email.getData()
  const eventData = fixtures.getEventData(messageData.service.id).opened

  const emailEvent = await request({
    method: 'POST',
    body: eventData,
    url: `${server.uri}/hooks/event`,
    json: true
  })

  const event = await email.event(emailEvent.data.id)

  t.deepEqual(event.event, eventData.event)
})
