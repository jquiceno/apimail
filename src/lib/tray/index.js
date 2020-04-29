'use strict'

const Db = require('../db')
const Config = require('getfig')
const moment = require('moment')
const Boom = require('boom')
const Joi = require('joi')

const configModule = Config.get('modules.tray')

// console.log(configModule)

const db = Db.init('trays', {
  type: 'firestore'
})

class Tray {
  constructor (id) {
    if (!id) {
      throw Boom.badRequest('Tray id not found or invalid')
    }
    this.id = id
    this.ref = db.doc(id)
  }

  async get () {
    try {
      const trayRef = this.ref
      let tray = await trayRef.get()
      tray = tray.data()

      if (!tray) {
        throw Boom.badRequest('Tray not found or invalid')
      }

      tray.id = trayRef.id
      return Promise.resolve(tray)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async getBy (key, value) {
    try {
      const ref = db
      let trays = []
      // let response = []

      let query = ref.where(key, '==', value)

      const traysRef = await query.get()

      traysRef.forEach(trayRef => {
        let trayData = trayRef.data()
        trayData.id = trayRef.id
        trays.push(trayData)
      })

      return Promise.resolve(trays)
    } catch (e) {
      return Promise.reject(new Boom(e.message))
    }
  }

  static async add (data) {
    try {
      const validEmail = Joi.validate(data.email, Joi.string().email())

      if (validEmail.error) {
        throw Boom.badRequest('Email not found or invalid')
      }

      const trays = await Tray.getBy('email', data.email)

      if (trays.length > 0) {
        throw Boom.conflict(`Tray with the email ${data.email} already exists`)
      }

      data._created = moment().unix()
      data._updated = moment().unix()

      const email = data.email.toLowerCase()

      data.domain = email.split('@')[1]
      data.name = email.split('@')[0]
      data.email = email

      const ref = db.doc()
      await ref.set(data)
      data.id = ref.id
      return Promise.resolve(data)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  async remove () {
    try {
      const trayData = await this.get()
      const trayRef = db.doc(trayData.id)
      await trayRef.delete()

      return Promise.resolve(trayData)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }
}

module.exports = Tray
