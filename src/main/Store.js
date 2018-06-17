import config from '../config.js'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'

class Store {
  constructor(defaults) {
    this.path = path.join(config.CONFIG_PATH, 'config.json')
    this.data = Object.assign(defaults, parseDataFile(this.path, defaults))
  }
  
  get(key) {
    return this.data[key]
  }
  
  set(key, val) {
    this.data[key] = val
    
    const directoryPath = path.dirname(this.path)
    mkdirp(directoryPath, err => {
      fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2))
    })
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath))
  } catch(error) {
    return defaults
  }
}

export default Store