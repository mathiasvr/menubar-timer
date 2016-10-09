const yo = require('yo-yo')
const hhmmss = require('hhmmss')
// TODO: mdl does not work well with morphdom, replace it?

module.exports = function (element, dispatch) {
  let tree = null
  let downAction = null

  return function update (state) {
    let newTree = layout(state)
    if (tree) return yo.update(tree, newTree)
    tree = newTree
    element.appendChild(tree)
  }

  function layout (state) {
    let notStopped = state.timer.status !== 'stopped'
    let playIcon = state.timer.status === 'running' ? 'pause' : 'play_arrow'
    let secs = notStopped ? Math.ceil(state.timer.time / 1000) : state.duration
    return yo`
      <div class="mdl-layout is-upgraded">
        <main class="mdl-layout__content mdl-typography--font-light">
          <div class="mdl-grid">
            <div class="mdl-cell">
              ${button('raised', playIcon, 'play-pause', notStopped)}
              ${button('raised', 'stop', 'stop')}
            </div>
            <div class="mdl-cell">${timerTable(secs, state)}</div>
            <div class="mdl-cell">${option('Show Timer', state.showTime, 'toggle-time')}</div>
          </div>
        </main>
      </div>`
  }

  function timerTable (s, state) {
    let [sec, min, hour] = hhmmss(s).split(':').reverse()
    hour = ('0' + (hour || 0)).slice(-2)

    let numFields = [hour, null, min, null, sec]
    let incButtons = ['inc-hour', null, 'inc-min', null, 'inc-sec']
    let decButtons = ['dec-hour', null, 'dec-min', null, 'dec-sec']

    let disable = state.timer.status !== 'stopped'

    return yo`
      <table class="mdl-data-table mdl-shadow--2dp">
        <tbody>
          <tr>${incButtons.map((action) => yo`<td>${button('icon', 'keyboard_arrow_up', action, false, disable)}</td>`)}</tr>
          <tr>${numFields.map((val) => yo`<td>${numberfield(val)}</td>`)}</tr>
          <tr>${decButtons.map((action) => yo`<td>${button('icon', 'keyboard_arrow_down', action, false, disable)}</td>`)}</tr>
        </tbody>
      </table>`
  }

  function button (type, icon, action, color, disable) {
    if (action == null) return null // td hack
    let click, mousedown, mouseup
    // hold down timer action
    if (action.startsWith('inc') || action.startsWith('dec')) {
      mousedown = () => {
        if (downAction) clearInterval(downAction)
        dispatch(action)
        downAction = setTimeout(() => {
          downAction = setInterval(() => dispatch(action), 80)
        }, 500)
      }
      mouseup = () => clearInterval(downAction)
    } else {
      click = () => dispatch(action)
    }
    return yo`
      <button class="mdl-button mdl-js-button mdl-button--${type} ${color ? 'mdl-button--colored' : ''}"
              onclick=${click} onmousedown=${mousedown} onmouseup=${mouseup} onmouseout=${mouseup}
              ${disable ? 'disabled' : ''}>
        <i class="material-icons">${icon}</i>
      </button>`
  }

  function numberfield (value) {
    // TODO: input type=number has build-in increament buttons, style and use them instead?
    if (value == null) return ':' // td hack
    return yo`<input class="mdl-textfield__input" value="${value}" readonly>`
  }

  function option (name, checked, action) {
    return yo`
      <label class="mdl-switch is-upgraded ${checked ? 'is-checked' : ''}"
             onclick=${(e) => dispatch(action)}>
        <span class="mdl-switch__label">Show Timer</span>
        <div class="mdl-switch__track"></div>
        <div class="mdl-switch__thumb"><span class="mdl-switch__focus-helper"></span></div>
      </label>`
  }
}
