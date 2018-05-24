'use strict'

import test from 'ava'
import Email from '../src/lib/email.js'
import fixtures from './fixtures'
import config from '../src/config'

let newMessage = null

test.before(async t => {
  const message = await Email.send(fixtures.getEmailData(), config.domain)
  newMessage = message.id
})

test('Get email message by id', async t => {
  const messageId = newMessage
  const message = new Email(messageId)
  const messageData = await message.getData()

  t.deepEqual(messageId, messageData.id)
})

test('Error message not fount', async t => {
  const message = new Email('dsfdfdsfd')
  const mE = await t.throws(message.getData())

  t.is(mE.status_code, 404)
  t.regex(mE.error.message, /There was an error getting the required message/)
})
