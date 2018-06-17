import { app, Menu, Tray } from 'electron'
import client from './windows/client'
import path from 'path'

let tray

function create() {
  if (process.platform !== 'win32') return
  
  tray = new Tray(getIconPath())

  tray.on('click', () => client.win.show())

  updateTrayMenu()
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate(getMenuTemplate())
  tray.setToolTip('MIMIC')
  tray.setContextMenu(contextMenu)
}

function getMenuTemplate() {
  return [
    {
      label: '종료',
      click: () => app.quit()
    }
  ]
}

function getIconPath () {
  const appIcon = path.join(__dirname, '..', '..', '/build/icons/icon')
  return process.platform === 'win32'
    ? appIcon + '.ico'
    : appIcon + '.png'
}

function hasTray() {
  return !!tray
}

export default {
  create,
  hasTray
}