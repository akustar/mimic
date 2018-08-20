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
					click: () => client.win.toggleDevTools()
				}
			]
		},
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          label: 'Paste Torrent Address',
					role: 'paste'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    }
	]
}


export default {
	init
}