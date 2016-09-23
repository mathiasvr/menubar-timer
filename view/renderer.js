const yo = require('yo-yo')
const hhmmss = require('hhmmss')
// TODO: mdl does not work well with morphdom, replace it.

module.exports = function (element, dispatch) {
  let tree = null

  return function update (state) {
    let newTree = layout(state)
    if (tree) return yo.update(tree, newTree)
    tree = newTree
    element.appendChild(tree)
  }

  function layout (state) {
    let playIcon = state.timer.status === 'running' ? 'pause' : 'play_arrow'
    let secs = state.timer.status === 'stopped' ? state.duration : state.timer.time / 1000
    return yo`
      <div class="mdl-layout is-upgraded">
        <main class="mdl-layout__content mdl-typography--font-light">
          <div class="mdl-grid">
            <div class="mdl-cell">
              ${button('raised', playIcon, 'play-pause', state.timer.status !== 'stopped')}
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

    let numFields = [hour || 0, null, min, null, sec]
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
    // TODO: proper disable
    return yo`
      <button class="mdl-button mdl-js-button mdl-button--${type} ${color ? 'mdl-button--colored' : ''}"
              onclick=${disable ? null : () => dispatch(action)}>
        <i class="material-icons">${icon}</i>
      </button>`
  }

  function numberfield (value) {
    // TODO: input type=number has build-in increament buttons! style and use them instead?
    // TODO: make editable
    if (value == null) return ':' // td hack
    return yo`<input class="mdl-textfield__input" type="number" min="0" max="60"
                     value="${value}" readonly="readonly">`
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
