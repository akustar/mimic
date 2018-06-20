import { app, Menu, Tray, nativeImage } from 'electron'
import client from './windows/client'
import path from 'path'
import config from '../config'

let tray

function create() {
  if (process.platform !== 'win32') return
  
  const image = nativeImage.createFromPath(getIconPath())
  tray = new Tray(image)

  tray.on('click', () => client.win.show())

  updateTrayMenu()
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate(getMenuTemplate())
  tray.setToolTip('MIMIC')
  tray.setContextMenu(contextMenu)
}

function getMenuTemplate () {
  return [
    {
      label: '종료',
      click: () => app.quit()
    }
  ]
}

function getIconPath () {
  return process.platform === 'win32'
    ? config.APP_ICON + '.ico'
    : config.APP_ICON + '.png'
}

function hasTray() {
  return !!tray
}

export default {
  create,
  hasTray
}