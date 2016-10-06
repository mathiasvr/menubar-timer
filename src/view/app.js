const {ipcRenderer, remote, screen} = require('electron')
const Timer = require('tiny-timer')
const hhmmss = require('hhmmss')

const PieIcon = require('../lib/pie-icon')
const renderer = require('./renderer')

const menuWindow = remote.getCurrentWindow()
const scaleFactor = screen.getPrimaryDisplay().scaleFactor

const drawIcon = PieIcon(document.createElement('canvas'), scaleFactor * 18)
const update = renderer(document.body, dispatch)

let state = {
  showTime: false,  // show time in menubar
  duration: 60,     // start duration in seconds.
  timer: new Timer({ interval: 500 }) // TODO: adjust to duration / limit icon gen
}

state.timer.on('tick', (ms) => {
  setIconTime(ms)
  setIconPercent(1 - ms / (state.timer.duration))
  if (menuWindow.isVisible()) update(state)
})

state.timer.on('done', () => showNotification())

// init view
update(state)

function dispatch (action) {
  if (action === 'play-pause') {
    if (state.timer.status === 'stopped') {
      state.timer.start(state.duration * 1000)
    } else if (state.timer.status === 'paused') {
      state.timer.resume()
    } else {
      state.timer.pause()
    }
  } else if (action === 'stop') {
    state.timer.stop()
    setIconTime(state.timer.time)
    setIconPercent(0)
  } else if (action === 'toggle-time') {
    state.showTime = !state.showTime
    ipcRenderer.send('set-title', '')
    setIconTime(state.timer.time)
  } else if (action === 'inc-hour') {
    state.duration += 3600
  } else if (action === 'inc-min') {
    state.duration += 60
  } else if (action === 'inc-sec') {
    state.duration += 1
  } else if (action === 'dec-hour') {
    state.duration -= 3600
  } else if (action === 'dec-min') {
    state.duration -= 60
  } else if (action === 'dec-sec') {
    state.duration -= 1
  }

  if (state.duration < 0) state.duration = 0

  update(state)
}

function setIconTime (ms) {
  let timeString = hhmmss(Math.ceil(ms / 1000))
  if (state.showTime) ipcRenderer.send('set-title', timeString)
  ipcRenderer.send('set-tooltip', ms > 0 ? timeString : null)
}

function setIconPercent (percent) {
  drawIcon(percent, (err, buffer) => err ? console.error(err) : ipcRenderer.send('set-icon', buffer))
}

function showNotification () {
  return new window.Notification(remote.app.getName(), {
    body: 'The timer has run out!'
  })
}
