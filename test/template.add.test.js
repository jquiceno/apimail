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

test('add new template', async t => {
  const tray = t.context.tray
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

  t.deepEqual(data.content, template.content)
  t.deepEqual(data.type, template.type)
  t.deepEqual(data.format, template.format)
  t.deepEqual(data.tray, tray.id)
  t.deepEqual(data.title, template.title)
  t.deepEqual(data.subject, template.subject)
  t.deepEqual(data.vars, template.vars)
  t.deepEqual(data.vars.name, template.vars.name)
})
