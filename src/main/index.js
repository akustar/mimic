import { app } from 'electron'
import client from './windows/client'
import webTorrent from './windows/webTorrent'
import streaming from './windows/streaming'
import Store from './Store'
import ipc from './ipc'
import tray from './tray'
import menu from './menu'
import state from '../renderer/lib/state'

const defaults = {
  downloads: app.getPath('downloads'),
  windowBounds: {
    width: 400,
    height: 640
  },
  torrents: {}
}
const store = new Store(defaults)

app.on('ready', () => {
  client.create(store)
  webTorrent.create('', 'identifier')

  menu.init()
  tray.create()

  ipc.init(store, client, webTorrent, streaming)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  client.win.show()
})