import path from 'path'
import applicationConfigPath from 'application-config-path'

const APP_NAME = 'mimic-desktop'
const appConfigPath = applicationConfigPath(APP_NAME)

export default {
  APP_NAME,
  APP_VERSION: require('../package.json').version,
  CONFIG_PATH: appConfigPath,
  POSTER_PATH: path.join(appConfigPath, 'Posters'),
  TORRENT_PATH: path.join(appConfigPath, 'Torrents')
}