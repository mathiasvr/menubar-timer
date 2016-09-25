const path = require('path')
const electron = require('electron')
const menubar = require('menubar')
const {ipcMain, nativeImage, Menu} = electron

const NAME_VERSION = 'Countdown Timer ' + require('./package').version

let scaleFactor = 1

ipcMain.on('set-title', (_, title) => mb.tray.setTitle(title))

ipcMain.on('set-tooltip', (_, tooltip) => mb.tray.setToolTip(tooltip || NAME_VERSION))

ipcMain.on('set-icon', (_, buffer) => {
  // let pngData = nativeImage.createFromDataURL(data).toPng()
  // let img = nativeImage.createFromBuffer(pngData, scaleFactor)
  let img = nativeImage.createFromBuffer(buffer, scaleFactor)

  img.setTemplateImage(true)
  mb.tray.setImage(img)
})

const mb = menubar({
  tooltip: NAME_VERSION,
  dir: 'view',
  icon: path.join(__dirname, 'icons/IconTemplate.png'), // TODO: gen, menubar does not support nativeImage
  width: 164,
  height: 270,
  resizable: false,
  // TODO: maybe move timer to main process, so this is not needed.
  preloadWindow: true,
  webPreferences: { backgroundThrottling: false } 
})

mb.on('ready', () => {
  scaleFactor = electron.screen.getPrimaryDisplay().scaleFactor

  const contextMenu = Menu.buildFromTemplate([
    // { type: 'separator' },
    { label: 'About', role: 'about' },
    { label: 'Debug', click: () => mb.window.openDevTools({ mode: 'undocked' }) /*, accelerator: 'Alt+Command+I' */},
    { label: 'Quit', role: 'quit' }
  ])

  mb.tray.on('right-click', () => mb.tray.popUpContextMenu(contextMenu))
})
