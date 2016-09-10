const {ipcRenderer} = require('electron')
const Tock = require('tocktimer') // TODO: replace
const zero2 = require('zero-fill')(2) // TODO: obsolete this

const $ = require('./lib/dom-query')
const PieIcon = require('./lib/pie-icon')

const drawIcon = PieIcon(document.createElement('canvas'), 36)

// TODO: save?
let state = {
  timer: 'stopped', // 'running', 'paused'
  showTime: false
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
    this.classList.add('mdl-button--colored')
    if (state.timer === 'paused') {
      timer.pause() // resume
    } else { // stopped
      let timeString = $('#hour-textfield').value + ':' + $('#min-textfield').value + ':' + $('#sec-textfield').value
      state.duration = timer.timeToMS(timeString)
      timer.start(state.duration) // restart
    }
    state.timer = 'running'
  }
})

$('#stop-button').on('click', function () {
  state.timer = 'stopped'
  timer.stop()
  // TODO: state/dom handler
  $('#start-button').children[0].innerText = 'play_arrow'
  $('#start-button').classList.remove('mdl-button--colored')
  if (state.showTime) ipcRenderer.send('set-title', '00:00:00')
})

$('#timer-switch').on('click', function () {
  state.showTime = this.checked
  ipcRenderer.send('set-title', '')
  onTimerUpdate()
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

// make value between 00 and 59
const pz2 = (val) => val < 0 ? 59 : zero2(val % 60)

// TODO: refactor this out of here
const ht = $('#hour-textfield')
const mt = $('#min-textfield')
const st = $('#sec-textfield')

// TODO: hold down for fast increament?
$('#inc-hour-button').on('click', () => { ht.value = pz2(parseInt(ht.value, 10) + 1) })
$('#inc-min-button').on('click', () => { mt.value = pz2(parseInt(mt.value, 10) + 1) })
$('#inc-sec-button').on('click', () => { st.value = pz2(parseInt(st.value, 10) + 1) })

$('#dec-hour-button').on('click', () => { ht.value = pz2(parseInt(ht.value, 10) - 1) })
$('#dec-min-button').on('click', () => { mt.value = pz2(parseInt(mt.value, 10) - 1) })
$('#dec-sec-button').on('click', () => { st.value = pz2(parseInt(st.value, 10) - 1) })
