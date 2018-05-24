'use strict'

import path from 'path'
import fs from 'fs'
import config from '../../config/config.json'

function findRcFile(directory = false) {
    if (!directory) {
        directory = path.dirname(module.parent.filename)
    }
    var file = path.resolve(directory, 'package.json')
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return file
    }
    var parent = path.resolve(directory, '..')
    if (parent === directory) {
        return null
    }

    return findRcFile(parent)
}

function getDataBySourse (mainPath, soursePath) {
  const fileName = `${mainPath}/${soursePath}`

  if (!fs.existsSync(fileName) && !fs.statSync(fileName).isFile()) {
    return null
  }

  const sourseData = require(fileName)

  return sourseData
}

const env = process.env.NODE_ENV || 'production'

const rcFilePath = findRcFile()
const mainPath = path.dirname(rcFilePath)
let configData = null
let dbKeyFilename = null

try {
  if (rcFilePath) {
    configData = require(rcFilePath).pimex.modules.email
    configData = getDataBySourse(mainPath, configData)
  } else {
    throw new Error('Hubo un error importando la configuración del modulo')
  }

  if (!getDataBySourse(mainPath, configData.db.keyFilename)) {
    throw new Error('Hubo un error importando la llave de la base de datos')
  }

  configData.module = config.module
} catch (e) {
  console.log(e)
  throw new Error(e.message)
}

module.exports = configData
