'use strict'

const { v4: uuid } = require('uuid')

module.exports = {
  message: () => {
    return {
      from: `John Due <${uuid()}@gmail.com>`,
      to: 'jquiceno@pimex.co',
      subject: 'Hello from Mailgun, test support email',
      content: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <a href="http://pimex.co">Click here to add your email address to a mailing list</a>'
    }
  }
}
