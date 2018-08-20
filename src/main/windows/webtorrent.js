import { BrowserWindow } from 'electron'

const webTorrent = {
  list: {},
  create
}

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080/webtorrent.html` : `file://${__dirname}/webtorrent.html`

function create (attach, torrentKey, ...args) {
  const win = new BrowserWindow({
    height: 0,
    width: 0,
    show: false
  })
  
  webTorrent.list[torrentKey] = win

  win.loadURL(winURL)
  win.webContents.on('did-finish-load', () => {
    if (attach) win.webContents.send(attach, torrentKey, ...args)
  })
  win.on('closed', () => {
    webTorrent.list[torrentKey] = null
    delete webTorrent.list[torrentKey]
  })
}

export default webTorrent
