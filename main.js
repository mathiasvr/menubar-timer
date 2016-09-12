const electron = require('electron')
const path = require('path')
const menubar = require('menubar')
const {ipcMain, nativeImage, Menu} = electron

let scaleFactor = 1

ipcMain.on('set-icon', (_, buffer) => {
  // let pngData = nativeImage.createFromDataURL(data).toPng()
  // let img = nativeImage.createFromBuffer(pngData, 2) //2x, todo: detect scale


  let img = nativeImage.createFromBuffer(buffer, scaleFactor)
  
  img.setTemplateImage(true)
  mb.tray.setImage(img)
})

ipcMain.on('set-title', (_, title) => mb.tray.setTitle(title))

const mb = menubar({
  tooltip: 'Countdown Timer ' + require('./package').version,
  dir: 'view',
  icon: path.join(__dirname, 'icons/IconTemplate.png'), // TODO: gen, menubar does not support nativeImage
  preloadWindow: true,
  width: 164,
  height: 270,
  resizable: false,
  webPreferences: { backgroundThrottling: false } // TODO: maybe move timer back to main process -_-
})

mb.on('ready', () => {
  const contextMenu = Menu.buildFromTemplate([
    // { label: 'Start/Stop', click: onStartStop },
    // { label: 'Pause/Start', click: () => countdown.pause() }, // todo maybe just alt+ start/stop
    // { label: 'Show Time', type: 'checkbox', checked: true }, // todo false
    // { label: 'Show Window', click: () => mb.showWindow() },
    // { type: 'separator' },
    // { label: 'About', role: 'about' },
    { label: 'Debug', click: () => mb.window.openDevTools({ mode: 'undocked' })/*, accelerator: 'Alt+Command+I' */},
    { label: 'Quit', role: 'quit' }
  ])

  scaleFactor = electron.screen.getPrimaryDisplay().scaleFactor
  
  mb.tray.on('right-click', () => mb.tray.popUpContextMenu(contextMenu))
})
