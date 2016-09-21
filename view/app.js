const {ipcRenderer} = require('electron')
const Tock = require('tocktimer') // TODO: replace

const PieIcon = require('../lib/pie-icon')
const renderer = require('./renderer')

const drawIcon = PieIcon(document.createElement('canvas'), 36)
const update = renderer(document.body, dispatch)

// TODO: persist?
let state = {
  timer: 'stopped', // 'running', 'paused'
  showTime: false,
  duration: 601, // start duration in seconds.
  runningDuration: null, // TODO
  toTimeString: (ms) => timer.msToTimecode(ms) // TODO: hack
}

function dispatch (action) {
  // console.log('action', action)

  if (action === 'play-pause') { // TODO: split?
    if (state.timer === 'stopped') {
      state.runningDuration = state.duration
      timer.start(state.duration * 1000)
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
    // TODO: fewer dispatch actions
    // TODO: only adjust hours not min/sec?
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

let timer = Tock({
  countdown: true,
  interval: 200, // TODO: adjust to duration / limit icon gen
  callback: onTimerUpdate,
  complete: onTimerEnd
})

update(state)

function onTimerUpdate () {
  // TODO update view with unified time so far
  let ms = timer.lap()
  let percent = 1 - ms / (state.runningDuration * 1000)
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
  })
}
