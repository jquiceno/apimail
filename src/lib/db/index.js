import admin from 'firebase-admin'
import config from '../../config'

const configModule = config.modules.messages

class Db {
  static init (collection, type = false) {
    try {
      let app = null
      const appName = 'pimex-messages'

      const serviceAccount = require(`${config.keysFolder}${configModule.db.keyFilename}`)

      const dbConfig = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: serviceAccount.databaseURL
      }

      if (!admin.apps.length) {
        admin.initializeApp(dbConfig)
        admin.firestore().settings({timestampsInSnapshots: true})
      }

      try {
        app = admin.app(appName)
      } catch (e) {
        admin.initializeApp(dbConfig, appName)
      }

      app = admin.app(appName)

      if (type === 'fb') {

        const db = admin.database(app)

        return db.ref(`/${collection}`)
      }

      const db = app.firestore()

      return db.collection(collection)
    } catch (e) {
      console.error(e)
      throw new Error('Hubo un error iniciando la base de datos')
    }
  }
}

module.exports = Db
