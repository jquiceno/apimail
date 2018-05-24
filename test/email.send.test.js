'use strict'

import test from 'ava'
import Email from '../src/lib/email.js'
import uuid from 'uuid-base62'
import fixtures from './fixtures'
import config from '../src/config'
import Server from '../src/services'
import request from 'request-promise'

test.beforeEach(async t => {
  const server = await Server.start('test')
  t.context.server = server
})

test('Send email', async t => {
  const server = t.context.server
  const e = await request({
    method: 'POST',
    body: fixtures.getEmailData(),
    url: `${server.uri}/`,
    json: true
  })

  // const e = await Email.send(fixtures.getEmailData(), config.domain)

  t.is(typeof e.data.id, 'string')
  t.is(e.status_code, 201)
})

test('Send Email - Error Missing parameter', async t => {
  const emailData = fixtures.getEmailData()
  delete emailData.to

  const mError = await t.throws(Email.send(emailData, config.providers.mailgun.domain))

  t.regex(mError.error.message, /parameter is missing/)
})

test('Send Email - Error data email not found', async t => {
  const mError = await t.throws(Email.send())

  t.regex(mError.error.message, /Bad request, email data not found/)
})
