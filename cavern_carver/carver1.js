const tickrate = 10 // MILLISECONDS

var stoneCanvas
var stoneDraw
var stoneMap // A MAP OF STONE HARDNESS
const noiseScale = {
	x: 2,
	y: 20
}

var scanCanvas
var scanDraw
var scanToDraw
var scanMap
var scanList
var scanListTemp
var layer

function startup() {
	stoneCanvas = document.getElementById("stoneCanvas")
	stoneDraw = stoneCanvas.getContext("2d")
	newStone()
	
	scanCanvas = document.getElementById("scanCanvas")
	scanDraw = scanCanvas.getContext("2d")
	newScan()
	
	window.setInterval(process,tickrate)
}

function populateStone() {
	const size = {
		x: 50,
		y: 50
	}
	noise.seed(Math.floor(Math.random()*65536)+1)
	stoneMap = []
	for (var a = 0; a < size.x; a++) {
		stoneMap.push([])
		for (var b = 0; b < size.y; b++) {
			var pos = {
				x: noiseScale.x*a/size.x,
				y: noiseScale.y*b/size.y
			}
			stoneMap[a].push((noise.perlin2(pos.x,pos.y)+1)/2) // POPULATED IN THIS CASE BY PERLIN NOISE
		}
	}
}

function drawStone() {
	var tile = { // SIZE OF EACH TILE IN PX
		x: Math.floor(stoneCanvas.width/stoneMap.length),
		y: Math.floor(stoneCanvas.height/stoneMap[0].length)
	}
	for (var a = 0; a < stoneMap.length; a++) {
		for (var b = 0; b < stoneMap[0].length; b++) {
			var saturation = (1-stoneMap[a][b])*100
			var hue  = saturation/2
			stoneDraw.fillStyle = "hsl("+hue+","+saturation+"%,50%)"
			stoneDraw.fillRect(a*tile.x,b*tile.y,tile.x,tile.y)
		}
	}
}

function newStone() {
	populateStone()
	drawStone()
}


function newScan() {
	populateScan()
	drawScan()
}

function populateScan() {
	const size = {
		x: 50,
		y: 50
	}
	scanList = []
	scanListTemp = []
	for (var i = 0; i < size.y; i++) {
		scanList.push([])
	}
	scanMap = []
	scanToDraw = []
	layer = size.y -1
	for (var a = 0; a < size.x; a++) {
		scanMap.push([])
		for (var b = 0; b < size.y; b++) {
			scanMap[a].push(true)
			scanToDraw.push({x:a,y:b})
			if (a<10 || a>20 || b<20 || b>35) {
				scanList[b].push(a)
			}
		}
	}
}

function drawScan() {
	var tile = { // SIZE OF EACH TILE IN PX
		x: Math.floor(scanCanvas.width/scanMap.length),
		y: Math.floor(scanCanvas.height/scanMap[0].length)
	}
	while (scanToDraw.length > 0) {
		var pos = scanToDraw.pop()
		if (scanMap[pos.x][pos.y]) {
			scanDraw.fillStyle = "hsl(140,65%,70%)"
		} else {
			scanDraw.fillStyle = "hsl(0,50%,70%)"
		}
		scanDraw.fillRect(pos.x*tile.x,pos.y*tile.y,tile.x,tile.y)
	}
}

function stepScan() {
	if (scanList[layer].length > 0) {
		var i = Math.floor(Math.random()*scanList[layer].length)
		var pos = scanList[layer][i]
		scanMap[pos][layer] = !scanMap[pos][layer]
		scanToDraw.push({x:pos,y:layer})
		scanListTemp.push(scanList[layer][i])
		scanList[layer].splice(i,1)
	} else {
		scanList[layer] = [...scanListTemp]
		scanListTemp = []
		layer -= 1
		if (layer < 0) {
			layer = scanMap[0].length-1
		}
		stepScan()
	}
}

function process() {
	stepScan()
	drawScan()
}
