'use strict'

const Db = require('../db')
const moment = require('moment')
const Boom = require('boom')
const Joi = require('joi')
const debug = require('debug')('tray:class')

const db = Db.init('trays', {
  type: 'firestore'
})

class Tray {
  constructor (id = false) {
    if (!id) {
      throw Boom.badRequest('Tray id not found or invalid')
    }
    this.id = id
    this.ref = db.doc(id)
  }

  static async getAll () {
    try {
      const trays = []
      const query = db

      const traysRef = await query.get()

      traysRef.forEach(trayRef => {
        const trayData = trayRef.data()
        trayData.id = trayRef.id
        trays.push(trayData)
      })

      return trays
    } catch (error) {
      throw new Boom(error)
    }
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
      return tray
    } catch (error) {
      throw new Boom(error)
    }
  }

  static async getAllBy (key, value) {
    try {
      const ref = db
      const trays = []
      const query = ref.where(key, '==', value)

      const traysRef = await query.get()

      traysRef.forEach(trayRef => {
        const trayData = trayRef.data()
        trayData.id = trayRef.id
        trays.push(trayData)
      })

      return trays
    } catch (error) {
      throw new Boom(error)
    }
  }

  static async add (data = null) {
    try {
      if (!data) throw Boom.badRequest('Tray data not fount or invalid')

      const date = moment().unix()

      const email = (typeof data === 'object') ? data.email : data
      const { error } = Joi.validate(email, Joi.string().email())

      if (error) throw Boom.badRequest('Email not found or invalid')

      const trays = await Tray.getAllBy('email', email)

      if (trays.length) throw Boom.conflict(`Tray with the email ${data.email} already exists`)

      const ref = db.doc()

      data = {
        domain: email.split('@')[1],
        name: email.split('@')[0],
        email: email.toLowerCase(),
        _created: date,
        _updated: date,
        status: 'active'
      }

      await ref.set(data)

      data.id = ref.id

      debug('Tray created')

      return data
    } catch (error) {
      debug('Error creating tray', error)
      throw new Boom(error)
    }
  }

  async remove () {
    try {
      const trayData = await this.get()
      const trayRef = db.doc(trayData.id)
      await trayRef.delete()

      return trayData.id
    } catch (error) {
      throw new Boom(error)
    }
  }
}

module.exports = Tray
