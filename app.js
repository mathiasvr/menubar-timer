const {ipcRenderer} = require('electron')
const Tock = require('tocktimer') // TODO: replace
const zero2 = require('zero-fill')(2) // TODO: obsolete this

const PieIcon = require('./lib/pie-icon')
const renderer = require('./renderer')

const drawIcon = PieIcon(document.createElement('canvas'), 36)
const update = renderer(document.body, dispatch)

// TODO: save?
let state = {
  timer: 'stopped', // 'running', 'paused'
  showTime: false,
  // TODO: unify (current duration, set duration)
  hour: 0,
  min: 1,
  sec: 14
}

// TODO: refactor
const bound = (val) => val < 0 ? 59 : val % 60

function dispatch (action) {
  // console.log('action', action)

  if (action === 'play-pause') { // TODO: split?
    if (state.timer === 'stopped') {
      let timeString = zero2(state.hour) + ':' + zero2(state.min) + ':' + zero2(state.sec)
      state.duration = timer.timeToMS(timeString)
      timer.start(state.duration)
    } else {
      timer.pause() // pause / resume
    }
    state.timer = state.timer === 'running' ? 'paused' : 'running'
  } else if (action === 'stop') {
    state.timer = 'stopped'
    timer.stop()
    // TODO: handle in onTimerUpdate
    drawIcon(0, (err, buffer) => ipcRenderer.send('set-icon', buffer))
    if (state.showTime) ipcRenderer.send('set-title', '00:00:00')
  } else if (action === 'toggle-time') {
    state.showTime = !state.showTime
    ipcRenderer.send('set-title', '')
    onTimerUpdate() // TODO: handle properly
  } else if (action === 'inc-hour') {
    state.hour = bound(state.hour + 1)
  } else if (action === 'inc-min') {
    state.min = bound(state.min + 1)
  } else if (action === 'inc-sec') {
    state.sec = bound(state.sec + 1)
  } else if (action === 'dec-hour') {
    state.hour = bound(state.hour - 1)
  } else if (action === 'dec-min') {
    state.min = bound(state.min - 1)
  } else if (action === 'dec-sec') {
    state.sec = bound(state.sec - 1)
  }

  update(state)
}

let timer = Tock({
  countdown: true,
  interval: 200, // TODO: adjust to duration / limit icon gen
  callback: onTimerUpdate,
  complete: onTimerEnd
})

update(state)

function onTimerUpdate () {
  let ms = timer.lap()
  let percent = 1 - ms / state.duration
  let timeString = timer.msToTimecode(ms)

  if (state.showTime) ipcRenderer.send('set-title', timeString)

  drawIcon(percent, (err, buffer) => ipcRenderer.send('set-icon', buffer))
}

function onTimerEnd () {
  dispatch('stop')
  showNotification()
}

function showNotification () {
  return new window.Notification('Countdown Timer', {
    body: 'The timer has run out!'
    // icon: 'icons/...' // TODO
  })
}
