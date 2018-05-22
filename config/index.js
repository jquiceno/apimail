'use strict'

import path from 'path'
import fs from 'fs'
import config from './config.json'

const env = process.env.NODE_ENV || 'production'

const mainPath = path.dirname(require.main.filename)
const configParentPath = `${mainPath}/.pimexrc/services/${config.module.name}/config.json`
const configDefaultPath = `${__dirname}/config.json`
let configData = null

const dbKeyParentPath = `${mainPath}/.pimexrc/services/${config.module.name}/${env}-key.json`
const dbKeyDefaultPath = `${__dirname}/${env}-key.json`
let dbKey = null

try {
  configData = fs.existsSync(configParentPath) ? require(configParentPath) : require(configDefaultPath)

  if (fs.existsSync(configParentPath)) {
    configData = require(configParentPath)
  } else if (fs.existsSync(configDefaultPath)) {
    configData = require(configDefaultPath)
  } else {
    throw new Error('Hubo un error importando la configuración del modulo')
  }

  if (fs.existsSync(dbKeyParentPath)) {
    dbKey = dbKeyParentPath
  } else if (fs.existsSync(dbKeyDefaultPath)) {
    dbKey = dbKeyDefaultPath
  } else {
    throw new Error('Hubo un error importando la llave de la base de datos')
  }

  configData.module = config.module

  configData.db = {
    keyFilename: `${__dirname}/${env}-key.json`
  }
} catch (e) {
  console.log(e)
  throw new Error(e.message)
}

module.exports = configData
