import { BrowserWindow } from 'electron'

const streaming = {
  create,
  list: []
}

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080/streaming.html` : `file://${__dirname}/streaming.html`

function create(webTorrent, torrentKey, ...args) {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 360,
    minHeight: 200,
    defaultEncoding: 'utf-8',
    backgroundColor: '#36393f',
    show: false,
    frame: false,
    webPreferences: {
      webSecurity: false
    }    
  })

  const index = streaming.list.length

  streaming.list.push(win)
  
  win.loadURL(winURL)

  win.once('ready-to-show', () => win.show())

  win.webContents.on('will-navigate', (event) => event.preventDefault())
  win.webContents.on('did-finish-load', (event) => win.webContents.send('did-finish-load', torrentKey, index, ...args))

  win.on('focus', () => win.webContents.send('focus'))
  win.on('blur', () => win.webContents.send('blur'))
  win.on('closed', (event) => {
    // 스트리밍 서버 종료
    webTorrent.webContents.send('wt-stop-server', index)

    destroy(win)
  })
}

function destroy(win) {
  const i = streaming.list.indexOf(win)
  if (i > -1) streaming.list.splice(i, 1)
  win = null
}

export default streaming
