import moment from 'moment'
import Db from '../db'
import config from '../../config'

const collection = 'templates'

class Template {
  constructor (id) {
    this.id = id
    this.db = Db.init(collection, 'fb')
  }

  async update (data) {
    try {
      const date = moment()
      let newData = Template.validFormat(data)

      const tempRef = this.db.child(this.id)

      newData._updated = date.unix()

      await tempRef.update(newData)

      newData = await this.get()

      return Promise.resolve(newData)
    } catch (e) {
      return Promise.reject({
        error: {
          message: e.message,
        },
        status_code: 404,
      })
    }
  }

  static validFormat (template) {
    const schema = Template.schema()

    let newTemplate = {}

    Object.keys(schema).map((key, i) => {
      if (template[key]) {
        newTemplate[key] = template[key]
      }
    })

    return newTemplate
  }

  static schema () {
    return {
      content: true,
      type: true,
      format: true
    }
  }

  static async getAll () {
    try {
      let templates = {}

      const db = Db.init(collection, 'fb')

      const templatesRef = await db.once('value')

      templates = templatesRef.val()

      return Promise.resolve(Template.normalize(templates))
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async get () {
    try {
      const tempRef = await this.db.child(this.id).once('value')
      let template = tempRef.val()

      if (!template) {
        throw new Error('Template not found or invalid')
      }

      template.ID = this.id

      return Promise.resolve(template)
    } catch (e) {
      return Promise.reject({
        error: {
          message: e.message,
        },
        status_code: 404,
      })
    }
  }

  static async add (data) {
    try {
      const date = moment()
      const db = Db.init(collection, 'fb')

      const templateData = Template.validFormat(data)

      templateData._created = date.unix()
      templateData._updated = date.unix()

      const newTemplate = await db.push(templateData)

      data.ID = newTemplate.key

      return Promise.resolve(data)
    } catch (e) {
      return Promise.reject({
        error: {
          message: 'hubo un error almacenando la nota',
          provider: e.message
        },
        status_code: 500
      })
    }
  }

  async remove () {
    try {
      const templateData = await this.get()
      await this.db.child(this.id).remove()
      return Promise.resolve(templateData)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  static normalize (data) {
    let normData = []

    for (let i in data) {
      data[i].ID = i
      normData.push(data[i])
    }

    return normData.reverse()
  }
}

module.exports = Template
