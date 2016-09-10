const {ipcMain, nativeImage, Menu} = require('electron')
const menubar = require('menubar')

ipcMain.on('set-icon', (event, buffer) => {
  // console.log('set icon:', buffer)
  // let pngData = nativeImage.createFromDataURL(data).toPng()
  // let img = nativeImage.createFromBuffer(pngData, 2) //2x, todo: detect scale

  let img = nativeImage.createFromBuffer(buffer, 2) // TODO: detect scale

  img.setTemplateImage(true)
  mb.tray.setImage(img)
})

ipcMain.on('set-title', (event, title) => {
  // console.log('set title:', title)
  mb.tray.setTitle(title)
})

const mb = menubar({
  tooltip: 'Countdown Timer ' + require('./package').version,
  icon: 'icons/IconTemplate.png', // TODO: gen, menubar does not support nativeImage
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
    { label: 'Debug', click: () => mb.window.openDevTools({ mode: 'detach' }) },
    { label: 'Quit', role: 'quit' }
  ])

  mb.tray.on('right-click', () => mb.tray.popUpContextMenu(contextMenu))
})
