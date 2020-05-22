'use strict'

const test = require('ava')
const { v4: uuid } = require('uuid')
const Tray = require('../src/lib/tray')
const Message = require('../src/lib/message')
const utils = require('./fixtures/utils')
const mocks = require('./fixtures/mocks')

test.before(async t => {
  const email = `${uuid()}@test.pimex.email`.toLowerCase()
  const trayData = await Tray.add(email)

  t.context.trayData = trayData
  t.context.trayTrash = [trayData.id]
  t.context.messageTrash = []
})

test.after(async t => {
  const { trayTrash, messageTrash } = t.context

  if (trayTrash.length) {
    await Promise.all(trayTrash.map(async id => {
      const tray = new Tray(id)
      await tray.remove()
    }))
  }

  if (messageTrash.length) {
    await Promise.all(messageTrash.map(async id => {
      const message = new Message(id)
      await message.remove()
    }))
  }
})

test('Add new message', async t => {
  const { messageTrash, trayTrash } = t.context
  const newMessageData = mocks.message()
  const messageData = await Message.add(newMessageData)

  const { error } = utils.validMessage(messageData, newMessageData)

  messageTrash.push(messageData.id)
  trayTrash.push(messageData.tray)
  t.falsy(error, error ? error.message : '')
})

test('Valid tray in new message', async t => {
  const { messageTrash, trayTrash } = t.context
  const newMessageData = mocks.message()
  const messageData = await Message.add(newMessageData)

  const tray = new Tray(messageData.tray)
  const trayData = await tray.get()

  const { error } = utils.validMessage(messageData, newMessageData)

  messageTrash.push(messageData.id)
  trayTrash.push(messageData.tray)
  t.falsy(error, error ? error.message : '')
  t.deepEqual(trayData.id, messageData.tray)
})

test('New message in exist tray', async t => {
  const { messageTrash, trayData } = t.context
  const newMessageData = mocks.message()
  const messageData = await Message.add({ tray: trayData.id, ...newMessageData })

  const { error } = utils.validMessage(messageData, newMessageData)

  messageTrash.push(messageData.id)
  t.falsy(error, error ? error.message : '')
  t.deepEqual(trayData.id, messageData.tray)
})

test('Get all messages', async t => {
  const { messageTrash, trayData } = t.context
  const messageData1 = await Message.add({ tray: trayData.id, ...mocks.message() })
  const messageData2 = await Message.add({ tray: trayData.id, ...mocks.message() })

  const messages = await Message.getAll()
  t.true(messages.filter(m => m.id === messageData1.id || m.id === messageData2.id).length === 2)

  messageTrash.push(messageData1.id)
  messageTrash.push(messageData2.id)
})

test('Get message by id', async t => {
  const { messageTrash, trayData } = t.context
  const newMessageData = mocks.message()
  const newMessage = await Message.add({ tray: trayData.id, ...newMessageData })

  const message = new Message(newMessage.id)
  const messageData = await message.get()

  const { error } = utils.validMessage(messageData, newMessageData)

  messageTrash.push(messageData.id)
  t.falsy(error, error ? error.message : '')
})

test('Remove a message', async t => {
  const { trayData } = t.context
  const newMessage = await Message.add({
    tray: trayData.id,
    ...mocks.message()
  })

  const message = new Message(newMessage.id)
  const messageRemove = await message.remove()

  const { error } = utils.validMessage(messageRemove)

  t.deepEqual(messageRemove.id, newMessage.id)
  t.falsy(error, error ? error.message : '')
})

test('Update a message', async t => {
  const { trayData } = t.context
  const newMessage = await Message.add({
    tray: trayData.id,
    ...mocks.message()
  })

  const newData = {
    state: 'sent'
  }

  const message = new Message(newMessage.id)
  const messageUpdate = await message.update(newData)

  const { error } = utils.validMessage(messageUpdate)

  t.deepEqual(messageUpdate.id, newMessage.id)
  t.deepEqual(messageUpdate.state, newData.state)
  t.falsy(error, error ? error.message : '')
})

test('Update a message with invalid fields', async t => {
  const { trayData } = t.context
  const newMessage = await Message.add({
    tray: trayData.id,
    ...mocks.message()
  })

  const newData = {
    created: uuid(),
    to: uuid()
  }

  const message = new Message(newMessage.id)
  const messageUpdate = await message.update(newData)

  const { error } = utils.validMessage(messageUpdate)

  t.deepEqual(messageUpdate.id, newMessage.id)
  t.deepEqual(messageUpdate.created, newMessage.created)
  t.deepEqual(messageUpdate.to, newMessage.to)
  t.falsy(error, error ? error.message : '')
})

test('Add new response menssage', async t => {
  const { messageTrash, trayTrash } = t.context
  const messageData = await Message.add(mocks.message())

  const replyData = await Message.add({ replyTo: messageData.id, ...mocks.message() })

  const { error } = utils.validMessage(replyData)
  t.falsy(error, error ? error.message : '')

  t.regex(messageData.from, new RegExp(replyData.to, 'i'))

  messageTrash.push(messageData.id)
  messageTrash.push(replyData.id)
  trayTrash.push(messageData.tray)
  trayTrash.push(messageData.tray)
})

test('New response from invalid message', async t => {
  const { output } = await t.throwsAsync(async () => {
    return Message.add({ replyTo: uuid(), ...mocks.message() })
  })

  const { statusCode, payload } = output

  t.deepEqual(statusCode, 400)
  t.regex(payload.message, /not found/)
})
