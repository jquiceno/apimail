'use strict'

import test from 'ava'
import uuid from 'uuid-base62'
// import Config from 'getfig'
import Tray from '../src/lib/tray'

test.afterEach(async t => {
  if (t.context.remove) {
    const tray = new Tray(t.context.remove)
    await tray.remove()
  }
})

test('Add new Tray', async t => {
  const email = `${uuid.v4()}@test.pimex.email`.toLowerCase()
  const tray = await Tray.add({
    email
  })

  t.context.remove = tray.id

  t.deepEqual(email, tray.email)
  t.deepEqual(email.split('@')[0].toLowerCase(), tray.name)
  t.deepEqual(email.split('@')[1].toLowerCase(), tray.domain)
})

test('Error Add new Tray conflict email', async t => {
  const email = `${uuid.v4()}@test.pimex.email`.toLowerCase()
  const tray = await Tray.add({
    email
  })

  const e = await t.throwsAsync(async () => {
    return Tray.add({
      email
    })
  })

  t.context.remove = tray.id

  t.regex(e.output.payload.message, /already exists/)
  t.is(e.output.statusCode, 409)
})

test('Error Add new Tray invalid email', async t => {
  const email = `${uuid.v4()}`.toLowerCase()

  const e = await t.throwsAsync(async () => {
    return Tray.add({
      email
    })
  })

  t.regex(e.output.payload.message, /Email not found or invalid/)
  t.is(e.output.statusCode, 400)
})
