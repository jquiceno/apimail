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

test('Get tray data', async t => {
  const email = `${uuid.v4()}@test.pimex.email`.toLowerCase()
  const newtray = await Tray.add({
    email
  })

  const tray = new Tray(newtray.id)
  const trayData = await tray.get()

  t.context.remove = newtray.id

  t.deepEqual(email, newtray.email)
  t.is(typeof trayData.id, 'string')
  t.deepEqual(trayData.email, email)
})

// test('Error Add new Tray conflict email', async t => {
//   const email = `${uuid.v4()}@test.pimex.email`.toLowerCase()
//   await Tray.add({
//     email
//   })
//
//   const e = await t.throwsAsync(async () => {
//     return Tray.add({
//       email
//     })
//   })
//
//   t.regex(e.output.payload.message, /already exists/)
//   t.is(e.output.statusCode, 409)
// })
//
// test('Error Add new Tray invalid email', async t => {
//   const email = `${uuid.v4()}`.toLowerCase()
//
//   const e = await t.throwsAsync(async () => {
//     return Tray.add({
//       email
//     })
//   })
//
//   t.regex(e.output.payload.message, /Email not found or invalid/)
//   t.is(e.output.statusCode, 400)
// })
