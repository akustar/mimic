import { ipcMain } from 'electron'

function init(store, client, webTorrent, streaming) {
  // 사용자 환경설정
  ipcMain.on('get', (event, key) => event.returnValue = store.get(key))
  ipcMain.on('set', (event, key, val) => store.set(key, val))

  // client -> webtorrent
  ipcMain.on('wt-start-torrent', (event, ...args) => webTorrent.create('wt-start-torrent', ...args))
  ipcMain.on('wt-create-torrent', (event, ...args) => webTorrent.create('wt-create-torrent', ...args))
  ipcMain.on('wt-parse-torrent', (event, ...args) => webTorrent.list['identifier'].webContents.send('wt-parse-torrent', ...args))
  ipcMain.on('wt-identifier-torrent', (event, ...args) => webTorrent.list['identifier'].webContents.send('wt-identifier-torrent', ...args))
  ipcMain.on('wt-stop-torrent', (event, torrentKey, ...args) => webTorrent.list[torrentKey].webContents.send('wt-stop-torrent', torrentKey, ...args))
  ipcMain.on('wt-select-files', (event, torrentKey, ...args) => webTorrent.list[torrentKey].webContents.send('wt-select-files', ...args))

  // webtorrent -> client
  ipcMain.on('wt-progress', (event, ...args) => client.win.webContents.send('wt-progress', ...args))
  ipcMain.on('wt-error', (event, ...args) => client.win.webContents.send('wt-error', ...args))
  ipcMain.on('wt-parse-result', (event, ...args) => client.win.webContents.send('wt-parse-result', ...args))
  ipcMain.on('wt-duplicate', (event, ...args) => {
    for (const key in webTorrent.list) {
      if (key !== 'identifier') {
        const win = webTorrent.list[key]
        win.webContents.send('wt-duplicate-torrent', ...args)
      }
    }
  })
  
  // client -> streaming
  ipcMain.on('wt-start-streaming', (event, torrentKey, ...args) => streaming.create(webTorrent.list[torrentKey], torrentKey, ...args))
  ipcMain.on('wt-start-server', (event, torrentKey, ...args) => webTorrent.list[torrentKey].webContents.send('wt-start-server', ...args))
  ipcMain.on('wt-stop-server', (event, torrentKey, ...args) => webTorrent.list[torrentKey].webContents.send('wt-stop-server', ...args))
  ipcMain.on('wt-server-running', (event, index, ...args) => streaming.list[index].webContents.send('wt-server-running', ...args))
  ipcMain.on('wt-loading-parts', (event, index, ...args) => streaming.list[index].webContents.send('wt-loading-parts', ...args))
  
  
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