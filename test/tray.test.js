'use strict'

const test = require('ava')
const { v4: uuid } = require('uuid')
const Tray = require('../src/lib/tray')

test.before(async t => {
  const email = `${uuid()}@test.pimex.email`.toLowerCase()
  const trayData = await Tray.add(email)

  t.context.trayData = trayData
  t.context.trayTrash = [trayData.id]
})

test.after(async t => {
  const { trayTrash } = t.context

  if (trayTrash.length) {
    await Promise.all(trayTrash.map(async id => {
      const tray = new Tray(id)
      await tray.remove()
    }))
  }
})

test('Add new Tray', async t => {
  const { trayTrash } = t.context

  const email = `${uuid()}@test.pimex.email`.toLowerCase()
  const tray = await Tray.add(email)

  trayTrash.push(tray.id)

  t.deepEqual(email, tray.email)
  t.deepEqual(email.split('@')[0].toLowerCase(), tray.name)
  t.deepEqual(email.split('@')[1].toLowerCase(), tray.domain)
})

test('Error Add new Tray conflict email', async t => {
  const { trayTrash } = t.context

  const email = `${uuid()}@test.pimex.email`.toLowerCase()
  const tray = await Tray.add({
    email
  })

  const e = await t.throwsAsync(async () => {
    return Tray.add(email)
  })

  trayTrash.push(tray.id)

  t.regex(e.output.payload.message, /already exists/)
  t.is(e.output.statusCode, 409)
})

test('Error Add new Tray invalid email', async t => {
  const email = `${uuid()}`.toLowerCase()

  const e = await t.throwsAsync(async () => {
    return Tray.add(email)
  })

  t.regex(e.output.payload.message, /Email not found or invalid/)
  t.is(e.output.statusCode, 400)
})

test('Get tray data', async t => {
  const { trayData } = t.context

  const tray = new Tray(trayData.id)
  const _trayData = await tray.get()

  t.deepEqual(trayData.email, _trayData.email)
  t.is(typeof _trayData.id, 'string')
})

test('Get all trays by email', async t => {
  const { trayData } = t.context

  const [_trayData] = await Tray.getAllBy('email', trayData.email)

  t.deepEqual(trayData.email, _trayData.email)
  t.is(typeof _trayData.id, 'string')
})

test('Remove Tray', async t => {
  const email = `${uuid()}@gmail.com`.toLowerCase()
  const trayData = await Tray.add(email)

  const tray = new Tray(trayData.id)
  const id = await tray.remove()

  t.is(typeof id, 'string')
  t.deepEqual(trayData.id, id)
})

test('Get all trays', async t => {
  const { trayData } = t.context

  const trays = await Tray.getAll()

  t.is(typeof trays, 'object')
  t.true(trays.filter(t => t.id === trayData.id).length > 0)
})
