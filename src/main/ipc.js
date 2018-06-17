import { ipcMain } from 'electron'

function init(store, client, webTorrent, streaming) {
  // 사용자 환경설정
  ipcMain.on('get', (event, key) => event.returnValue = store.get(key))
  ipcMain.on('set', (event, key, val) => store.set(key, val))

  // client -> webtorrent
  ipcMain.on('wt-start-torrent', (event, ...args) => webTorrent.win.webContents.send('wt-start-torrent', ...args))
  ipcMain.on('wt-stop-torrent', (event, ...args) => webTorrent.win.webContents.send('wt-stop-torrent', ...args))
  ipcMain.on('wt-parse-torrent', (event, ...args) => webTorrent.win.webContents.send('wt-parse-torrent', ...args))
  ipcMain.on('wt-identifier-torrent', (event, ...args) => webTorrent.win.webContents.send('wt-identifier-torrent', ...args))

  // webtorrent -> client
  ipcMain.on('wt-parse-result', (event, ...args) => client.win.webContents.send('wt-parse-result', ...args))
  ipcMain.on('wt-progress', (event, ...args) => client.win.webContents.send('wt-progress', ...args))
  ipcMain.on('wt-error', (event, ...args) => client.win.webContents.send('wt-error', ...args))

  // client -> streaming
  ipcMain.on('wt-create-streaming', (event, ...args) => streaming.create(webTorrent, ...args))

  // streaming -> webtorrent
  ipcMain.on('wt-start-server', (event, ...args) => webTorrent.win.webContents.send('wt-start-server', ...args))
  ipcMain.on('wt-stop-server', (event, ...args) => webTorrent.win.webContents.send('wt-stop-server', ...args))
  
  // webtorrent -> streaming
  ipcMain.on('wt-server-running', (event, winIndex, ...args) => streaming.win[winIndex].webContents.send('wt-server-running', ...args))
  
  // 타이틀바
  ipcMain.on('win-minimize', () => client.win.minimize())
  ipcMain.on('win-maximize', () => {
    if (process.platform !== 'darwin') {
      if (!client.win.isMaximized()) client.win.maximize()
      else client.win.unmaximize()
    // MacOs
    } else client.win.setFullScreen(!client.win.isFullScreen())
  })
  ipcMain.on('win-close', () => client.win.hide())
}

export default {
  init
}