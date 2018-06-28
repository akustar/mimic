import path from 'path'
import fs from 'fs-extra'
import config from '../../config.js'

const configPath = path.join(config.CONFIG_PATH, 'config.json')

const target = {
  downloads: config.DEFAULT_DOWNLOAD_PATH,
  windowBounds: {
    width: 400,
    height: 640
  },
  torrents: {}
}

function saveImmediate (target) {
  fs.writeJson(configPath, target, (err) => {
    if (err) console.error(err)
  })
}

const state = new Proxy(target, {
  get(...args) {
    return Reflect.get(...args)
  },
  set(...args) {
    saveImmediate(...args)
    return Reflect.set(...args)
  }
})


export default state

