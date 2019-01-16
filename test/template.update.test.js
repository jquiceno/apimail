'use strict'

import test from 'ava'
import uuid from 'uuid-base62'
import Tray from '../src/lib/tray'
import Template from '../src/lib/template'

test.beforeEach(async t => {
  const email = `${uuid.v4()}@test.pimex.email`.toLowerCase()
  const tray = await Tray.add({
    email
  })

  t.context.tray = tray

  const data = {
    content: '<h1>Hola {{name}}</h1>',
    type: 'html',
    format: 'html',
    tray: tray.id,
    title: 'Test template',
    subject: 'Test message by template test',
    vars: {
      name: 'John Quiceno'
    }
  }

  const template = await Template.add(data)

  t.context.template = template
})

test.afterEach(async t => {
  if (t.context.tray) {
    const tray = new Tray(t.context.tray.id)
    await tray.remove()
  }

  if (t.context.template) {
    const template = new Template(t.context.template.id)
    await template.remove()
  }
})

test('Update data template', async t => {
  const tData = t.context.template
  const newData = {
    subject: 'New Subject for test'
  }
  const template = new Template(tData.id)

  const templateUpdate = await template.update(newData)
  const templateData = await template.get()

  t.deepEqual(templateUpdate.subject, newData.subject)
  t.deepEqual(templateData.subject, newData.subject)
})

test('Update template clear invalid data', async t => {
  const tData = t.context.template
  const newData = {
    subject: 'New Subject for test',
    testData: true
  }
  const template = new Template(tData.id)

  const templateUpdate = await template.update(newData)
  const templateData = await template.get()

  t.is(!templateUpdate.testData, true)
  t.is(!templateData.testData, true)
  t.deepEqual(templateUpdate.subject, newData.subject)
  t.deepEqual(templateData.subject, newData.subject)
})
