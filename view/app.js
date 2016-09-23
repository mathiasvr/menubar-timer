const {ipcRenderer} = require('electron')
const Tock = require('tocktimer') // TODO: replace
const Timer = require('../timer') // TODO: replace

const PieIcon = require('../lib/pie-icon')
const renderer = require('./renderer')

const drawIcon = PieIcon(document.createElement('canvas'), 36)
const update = renderer(document.body, dispatch)

const tock = Tock() // TODO: remove
const msToTimecode = tock.msToTimecode.bind(tock) //todo

// TODO: persist?
let state = {
  showTime: false,
  duration: 601, // start duration in seconds.
  runningDuration: null, // TODO
  toTimeString: (ms) => msToTimecode(ms), // TODO: hack
  get ms () { return timer.time },  // current ms
  get timer () { return timer.state}, // todo
}

function dispatch (action) {
  // console.log('action', action)
  if (action === 'play-pause') { // TODO: split?
    if (state.timer === 'stopped') {
      state.runningDuration = state.duration
      timer.start(state.duration * 1000)
    } else if (timer.state === 'paused') {
      timer.resume()
    } else {
      timer.pause()
    }
    //state.timer = state.timer === 'running' ? 'paused' : 'running'
  } else if (action === 'stop') {
    //state.timer = 'stopped'
    timer.stop()
    setIconTime(timer.time)
  } else if (action === 'toggle-time') {
    state.showTime = !state.showTime
    ipcRenderer.send('set-title', '')
    setIconTime(timer.time)
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

let timer = new Timer({
  interval: 500 // TODO: adjust to duration / limit icon gen
})

timer.on('tick', (ms) => {
  let percent = 1 - ms / (state.runningDuration * 1000)
  setIconTime(ms)
  drawIcon(percent, (err, buffer) => ipcRenderer.send('set-icon', buffer))
  update(state)
})

timer.on('done', () => {
  dispatch('stop')
  showNotification()
})

update(state) // TODO: NEC?

function setIconTime (ms) {
  let timeString = msToTimecode(ms)
  if (state.showTime) ipcRenderer.send('set-title', timeString)
  ipcRenderer.send('set-tooltip', ms > 0 ? timeString : null)
}

function showNotification () {
  return new window.Notification('Countdown Timer', {
    body: 'The timer has run out!'
  })
}
