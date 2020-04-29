'use strict'

const admin = require('firebase-admin')
const fs = require('fs')
const Error = require('boom')
const Config = require('getfig')

const configModule = Config.get('modules.db')

class Firebase {
  constructor (serviceAccount) {
    try {
      this.app = null

      const appName = `pimex-${serviceAccount.project_id}`

      const dbConfig = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: serviceAccount.databaseURL
      }

      if (!admin.apps.length) {
        admin.initializeApp(dbConfig)
      }

      try {
        this.app = admin.app(appName)
      } catch (e) {
        admin.initializeApp(dbConfig, appName)
        admin.app(appName).firestore().settings({ timestampsInSnapshots: true })
      }

      this.app = admin.app(appName)
    } catch (e) {
      return new Error(e)
    }
  }

  firestore (collection = false) {
    try {
      const db = this.app.firestore()

      if (collection) {
        return db.collection(collection)
      }

      return db
    } catch (e) {
      return new Error(e)
    }
  }

  firebase (collection = false) {
    try {
      const db = admin.database(this.app)

      if (collection) {
        return db.ref(`/${collection}`)
      }

      return db
    } catch (e) {
      return new Error(e)
    }
  }

  static init (collection = false, params = false) {
    try {
      let keyPath = null

      if (!params.keyPath) {
        keyPath = `${Config.get('paths.keysFolder')}/${configModule.keyFilename}`
      }

      if (!keyPath || !fs.existsSync(keyPath)) {
        throw new Error('Firebase key not found or invalid')
      }

      const serviceAccount = require(keyPath)

      const db = new Firebase(serviceAccount)

      if (params.type === 'firestore') {
        return db.firestore(collection)
      }

      return db.firebase(collection)
    } catch (e) {
      return new Error(e)
    }
  }
}

module.exports = Firebase
