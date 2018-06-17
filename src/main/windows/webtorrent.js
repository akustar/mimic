import { BrowserWindow } from 'electron'

const webTorrent = {
  win: null,
  create
}
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080/webtorrent.html` : `file://${__dirname}/webtorrent.html`

function create() {
  const win = webTorrent.win = new BrowserWindow({
    height: 0,
    width: 0,
    show: false
  })
  
  win.loadURL(winURL)
  win.on('closed', () => webTorrent.win = null)
}

export default webTorrent
