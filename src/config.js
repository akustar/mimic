import os from 'os'
import path from 'path'
import electron from 'electron'

function darwin (name) {
  return path.join(process.env['HOME'], 'Library', 'Application Support', name)
}

function linux (name) {
  if (process.env['XDG_CONFIG_HOME']) {
    return path.join(process.env['XDG_CONFIG_HOME'], name)
  }

  return path.join(process.env['HOME'], '.config', name)
}

function win32 (name) {
  if (process.env['LOCALAPPDATA']) {
    return path.join(process.env['LOCALAPPDATA'], name)
  }

  return path.join(process.env['USERPROFILE'], 'Local Settings', 'Application Data', name)
}

function getPath (key) {
  if (!process.versions.electron) {
    // Node.js process
    return ''
  } else if (process.type === 'renderer') {
    // Electron renderer process
    return electron.remote.app.getPath(key)
  } else {
    // Electron main process
    return electron.app.getPath(key)
  }
}

function applicationConfigPath (name) {
  if (typeof name !== 'string') {
    throw new TypeError('`name` must be string')
  }

  switch (os.platform()) {
    case 'darwin': return darwin(name)
    case 'linux': return linux(name)
    case 'win32': return win32(name)
  }

  throw new Error('Platform not supported')
}

const APP_NAME = require('../package.json').name
const appConfigPath = applicationConfigPath(APP_NAME)

export default {
  APP_NAME,
  APP_VERSION: require('../package.json').version,
  APP_ICON: path.join(__dirname, '..', 'build/icons', 'icon'),
  CONFIG_PATH: appConfigPath,
  POSTER_PATH: path.join(appConfigPath, 'Posters'),
  TORRENT_PATH: path.join(appConfigPath, 'Torrents'),
  DEFAULT_DOWNLOAD_PATH: getPath('downloads')
}