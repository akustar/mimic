import { BrowserWindow } from 'electron'

const streaming = {
  create,
  win: []
}

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080/streaming.html` : `file://${__dirname}/streaming.html`

function create(webTorrent, ...args) {
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

  const winIndex = streaming.win.length

  streaming.win.push(win)
  
  win.loadURL(winURL)

  win.once('ready-to-show', () => win.show())

  win.webContents.on('will-navigate', (event) => event.preventDefault())
  win.webContents.on('did-finish-load', (event) => win.webContents.send('did-finish-load', winIndex, ...args))

  win.on('focus', () => win.webContents.send('focus'))
  win.on('blur', () => win.webContents.send('blur'))
  win.on('closed', () => {
    // 스트리밍 서버 종료
    webTorrent.win.webContents.send('wt-stop-server', winIndex)

    destroy(win)
  })
}

function destroy(win) {
  const i = streaming.win.indexOf(win)
  if (i > -1) streaming.win.splice(i, 1)
  win = null
}

export default streaming
