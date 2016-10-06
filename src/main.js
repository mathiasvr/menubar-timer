const path = require('path')
const electron = require('electron')
const menubar = require('menubar')
const {ipcMain, nativeImage, Menu} = electron

const mb = menubar({
  dir: path.join(__dirname, 'view'),
  // TODO: generate, menubar does not support nativeImage
  icon: path.join(__dirname, 'IconTemplate.png'),
  width: 164,
  height: 270,
  resizable: false,
  // TODO: maybe move timer to main process to avoid this.
  preloadWindow: true,
  webPreferences: { backgroundThrottling: false }
})

mb.on('ready', () => {
  const NAME_VERSION = mb.app.getName() + ' ' + require('../package').version
  const SCALE_FACTOR = electron.screen.getPrimaryDisplay().scaleFactor

  mb.tray.setToolTip(NAME_VERSION)

  const contextMenu = Menu.buildFromTemplate([
    { role: 'about' },
    // TODO: remove after v1.0
    { label: 'Developer Tools', click: () => mb.window.openDevTools({ mode: 'detach' }) },
    { type: 'separator' },
    { role: 'quit' }
  ])

  mb.tray.on('right-click', () => mb.tray.popUpContextMenu(contextMenu))

  ipcMain.on('set-title', (_, title) => mb.tray.setTitle(title))

  ipcMain.on('set-tooltip', (_, tooltip) => mb.tray.setToolTip(tooltip || NAME_VERSION))

  ipcMain.on('set-icon', (_, buffer) => {
    // TODO: maybe just use data-url when scaling is supported
    // let pngData = nativeImage.createFromDataURL(data).toPng()
    // let img = nativeImage.createFromBuffer(pngData, scaleFactor)
    let img = nativeImage.createFromBuffer(buffer, SCALE_FACTOR)

    img.setTemplateImage(true)
    mb.tray.setImage(img)
  })
})
