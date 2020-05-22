'use strict'

const Joi = require('@hapi/joi')

module.exports = {
  validMessage (message, compare = null, ext = {}) {
    const schema = {
      created: Joi.number().required(),
      contentType: Joi.string().allow(null),
      content: Joi.string().required(),
      to: Joi.string().email().required(),
      from: Joi.string().required(),
      subject: Joi.string(),
      state: Joi.string().required(),
      replyTo: Joi.string().allow(null),
      data: Joi.object(),
      tray: Joi.string(),
      id: Joi.string().required()
    }

    if (compare) {
      Object.keys(compare).map(k => {
        schema[k] = schema[k].valid(compare[k])
      })
    }

    return Joi.object().keys({
      ...schema,
      ...ext
    }).validate(message, {
      allowUnknown: true
    })
  }
}
