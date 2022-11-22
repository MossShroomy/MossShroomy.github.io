var combImg

var honeyImgs = []
var sliderCanvas
var sliderDraw

function startup() {
  // SET CONTEXTS
  sliderCanvas = document.getElementById("sliderCanvas")
  sliderDraw = sliderCanvas.getContext("2d")

  // LOCATE SPRITES
//  for (var i = 1; i < 19; i++) {
//    var newHoney = new Image()
//    newHoney.src = '/resources/' + i + '.png'
//    honeyImgs.append(newHoney)
//  }
  combImg = document.getElementById("comb")
//  document.body.appendChild(combImg)

  // DRAW COMB
  sliderDraw.drawImage(combImg, 0, 0)


  var text = document.getElementById("h")
  text.textContent += "MIPES"
}
