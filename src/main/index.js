import { app, protocol } from 'electron'
import Registry from 'winreg'
import client from './windows/client'
import webTorrent from './windows/webTorrent'
import streaming from './windows/streaming'
import Store from './Store'
import ipc from './ipc'
import tray from './tray'
import menu from './menu'

const defaults = {
  downloads: app.getPath('downloads'),
  windowBounds: {
    width: 400,
    height: 640
  },
  openExternalPlayer: false,
  torrents: {}
}
const store = new Store(defaults)

app.on('ready', () => {
  client.create(store)
  webTorrent.create('', 'identifier')

  menu.init()
  tray.create()

  ipc.init(store, client, webTorrent, streaming)

  console.log(Registry.HKCU)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  client.win.show()
})