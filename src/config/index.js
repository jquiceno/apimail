import path from 'path'
import fs from 'fs'

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

const env = process.env.NODE_ENV || 'production'

try {
  const rcFilePath = findRcFile(process.env.PIMEX_CONFIG)

  if (!rcFilePath) throw new Error('Error getting the configuration file .pimexrc.json in module')

  let configData = null

  configData = require(rcFilePath)
  configData.mainPath = path.dirname(rcFilePath)
  if (configData.keysFolder) {
    configData.keysFolder = `${configData.mainPath}/${configData.keysFolder}/`
  }

  configData.modules.messages.keysFolder = configData.keysFolder

  module.exports = configData.modules.messages
} catch (e) {
  console.log(e)
  throw new Error(e.message)
}
