import path from 'path'
import fs from 'fs'
import config from '../../config/config.json'

function findRcFile(directory = false) {
    if (!directory) {
      directory = path.dirname(require.main.filename)
    }

    var file = path.resolve(directory, '.pimexrc.json')
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

try {
  const rcFilePath = findRcFile(process.env.PIMEX_CONFIG)

  if (!rcFilePath) throw new Error('Error getting the configuration file .pimexrc.json in message module')

  let configData = null
  if (rcFilePath) {
    const mainPath = path.dirname(rcFilePath)
    configData = require(rcFilePath).modules.message
    //configData = getDataBySourse(mainPath, configData)
    if (!getDataBySourse(mainPath, configData.db.keyFilename)) {
      throw new Error('Hubo un error importando la llave de la base de datos')
    }

    configData.module = config.module
    module.exports = configData
  } else {
    throw new Error('Hubo un error importando la configuración del modulo')
  }
} catch (e) {
  console.log(e)
  throw new Error(e.message)
}
