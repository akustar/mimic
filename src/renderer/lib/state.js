import path from 'path'
import fs from 'fs-extra'
import config from '../../config.js'

const configPath = path.join(config.CONFIG_PATH, 'config.json')
const directoryPath = path.dirname(configPath)

function setupState () {
  const defaults = {
    downloads: config.DEFAULT_DOWNLOAD_PATH,
    windowBounds: {
      width: 400,
      height: 640
    },
    torrents: {}
  }

  try {
    const saved = fs.readJSONSync(configPath)
    return Object.assign(defaults, saved)
  } catch (err) {
    return defaults
  }
}

function saveImmediate (state) {
  fs.ensureDir(directoryPath, (err) => {
    fs.writeJson(configPath, state, {spaces: 2}, (err) => {
      if (err) console.error(err)
    })
  })
}

const state = new Proxy(setupState(), {
  get (...args) {
    return Reflect.get(...args)
  },
  set (...args) {
    saveImmediate(...args)
    return Reflect.set(...args)
  }
})

export default state

