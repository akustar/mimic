import electron from 'electron'
import client from './windows/client'

let menu = null

function init () {
  menu = electron.Menu.buildFromTemplate(getMenuTemplate())
  electron.Menu.setApplicationMenu(menu)
}

function getMenuTemplate () {
	return [
		{
			label: '도움말',
			submenu: [
				{
					label: '개발자 도구 설정/해제',
					accelerator: process.platform === 'darwin'
					? 'Alt+Command+I'
					: 'Ctrl+Shift+I',
					click: (item, focusedWindow) => {
						if (focusedWindow) focusedWindow.webContents.toggleDevTools()
					}
				}
			]
		},
		{
			role: 'window',
			submenu: [
				{
					role: 'close'
				}
			]
		}
	]
}


export default {
	init
}