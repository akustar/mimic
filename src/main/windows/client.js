import { app, BrowserWindow } from 'electron'
import debounce from 'debounce'

const client = {
  win: null,
  create
}

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080/` : `file://${__dirname}/index.html`

function create(state) {
  const win = client.win = new BrowserWindow({
    ...state.windowBounds,
    title: 'MIMIC',
    minWidth: 360,
    minHeight: 290,
    defaultEncoding: 'utf-8',
    backgroundColor: '#36393f',
    show: false,
    frame: false,
    webPreferences: {
      webSecurity: false
    }
  })

  win.loadURL(winURL)

  win.once('ready-to-show', () => win.show())

  win.webContents.on('will-navigate', event => event.preventDefault())

  win.on('focus', () => win.webContents.send('focus'))
  win.on('blur', () => win.webContents.send('blur'))

  win.on('resize', debounce(event => {
    state.windowBounds = Object.assign(state.windowBounds, event.sender.getBounds())
  }, 250))
  win.on('move', debounce(event => {
    state.windowBounds = Object.assign(state.windowBounds, event.sender.getBounds())
  }, 250))

  win.on('close', () => {
    if (process.platform !== 'darwin') app.quit()
  })
  win.on('closed', () => client.win = null)
}

export default client