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

test('Error Template intance', async t => {
  const error = t.throws(() => {
    return new Template()
  })

  t.regex(error.output.payload.message, /not found/)
  t.is(error.output.statusCode, 400)
})

test('Error template not found', async t => {
  const template = new Template(uuid.v4())

  const error = await t.throwsAsync(() => {
    return template.get()
  })

  t.regex(error.output.payload.message, /not found/)
  t.is(error.output.statusCode, 400)
})

test('Get template Data', async t => {
  const tData = t.context.template

  const template = new Template(tData.id)

  const templateData = await template.get()

  t.is(typeof templateData.id, 'string')
  t.deepEqual(tData.subject, templateData.subject)
})

test('Get render template defined vars', async t => {
  const tData = t.context.template

  const template = new Template(tData.id)

  const templateData = await template.get({
    render: true
  })

  t.deepEqual(tData.subject, templateData.subject)
  t.is((templateData.content.indexOf(tData.vars.name) > 0), true)
})

test('Get render template custom vars', async t => {
  const tData = t.context.template

  const template = new Template(tData.id)

  const vars = {
    name: 'Julian Quiceno',
    email: 'julianquiceno@test.com'
  }

  const templateData = await template.get({
    render: vars
  })

  t.deepEqual(tData.subject, templateData.subject)
  t.is((templateData.content.indexOf(vars.name) > 0), true)
})
