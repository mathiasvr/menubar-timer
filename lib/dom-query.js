// hacks
module.exports = function (query) {
  let el = document.querySelector(query)
  el.on = el.addEventListener
  return el
}
