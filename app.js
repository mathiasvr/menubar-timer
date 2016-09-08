const {ipcRenderer} = require('electron')
const Tock = require('tocktimer') // TODO: replace

const $ = require('./lib/dom-query')
const PieIcon = require('./lib/pie-icon')

const drawIcon = PieIcon(document.createElement('canvas'), 36)

// TODO: save?
let state = {
  timer: 'stopped', // 'running', 'paused'
  showTime: true // TODO: false
}

let timer = Tock({
  countdown: true,
  interval: 200, // TODO: adjust to duration / limit icon gen
  callback: onTimerUpdate,
  complete: onTimerEnd
})

$('#start-button').on('click', function () {
  if (state.timer === 'running') {
    state.timer = 'paused'
    this.children[0].innerText = 'play_arrow'
    timer.pause()
  } else {
    this.children[0].innerText = 'pause'
    if (state.timer === 'paused') {
      timer.pause() // resume
    } else { // stopped
      state.duration = timer.timeToMS($('#time-textfield').value)
      timer.start(state.duration) // restart
    }
    state.timer = 'running'
  }
})

$('#stop-button').on('click', function () {
  console.log('stop click')
  state.timer = 'stopped'
  timer.stop()
  // TODO: state/dom handler
  $('#start-button').children[0].innerText = 'play_arrow'
  ipcRenderer.send('set-title', '00:00:00')
})

$('#timer-switch').on('click', function () {
  state.showTime = this.checked
  ipcRenderer.send('set-title', '')
})

function onTimerUpdate () {
  let ms = timer.lap()
  let percent = 1 - ms / state.duration
  let timeString = timer.msToTimecode(ms)

  if (state.showTime) ipcRenderer.send('set-title', timeString)

  drawIcon(percent, (err, buffer) => ipcRenderer.send('set-icon', buffer))
}

function onTimerEnd () {
  showNotification()
  drawIcon(0, (err, buffer) => ipcRenderer.send('set-icon', buffer))
}

function showNotification () {
  return new window.Notification('Countdown', {
    body: 'The timer has run out!'
    // icon: 'icons/...' // TODO
  })
}
