const toBuffer = require('blob-to-buffer')

// make pie chart like png image with a html canvas
module.exports = function (canvas, size) {
  let context = canvas.getContext('2d')

  canvas.width = size
  canvas.height = size
  context.lineWidth = 2

  // arc params
  let centerX = canvas.width / 2
  let centerY = canvas.height / 2
  let radius = canvas.width / 2 - context.lineWidth
  let startAngle = Math.PI * 1.5

  return function render (percent, cb) {
    let endAngle = startAngle + 2 * Math.PI * percent

    context.clearRect(0, 0, canvas.width, canvas.height)

    // pie
    context.beginPath()
    context.arc(centerX, centerY, radius, startAngle, endAngle)
    context.lineTo(centerX, centerY)
    context.closePath()
    // context.fillStyle = 'red'
    context.fill()

    // circle outline
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    // context.lineWidth = lineWidth
    // context.strokeStyle = '#000000'
    context.stroke()

    canvas.toBlob((blob) => toBuffer(blob, cb)) // cb(err, buffer)
    
    // cb(null, canvas.toDataURL())
    // return canvas.toDataURL('image/png')
  }
}
