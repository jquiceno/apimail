'use strict'

// import * as firebase from 'firebase-admin'
import Firestore from '@google-cloud/firestore'
import config from '../config'

class Db {
  static init (collection) {
    let db = null
    try {
      db = new Firestore({
        projectId: config.db.project_id,
        keyFilename: config.db.keyFilename
      }).collection(collection)
    } catch (e) {
      console.log(e)
      throw new Error('Hubo un error iniciando la base de datos en firestore')
    }

    return db
  }
}

module.exports = Db
