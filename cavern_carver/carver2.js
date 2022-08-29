const tickrate = 50 // MILLISECONDS
var time = 0 // TICKS

const size = {
	x: 25,
	y: 50
}
const air = {
	substance: "air",
	blue: 0,
	green: 0,
	direction: {x:0,y:0}
}

var mapCanvas
var mapDraw
var tileMap // 2D MAP OF TILES
var drawList // ARRAY OF TILES TO DRAW OVER
var waterList // 2D ARRAY CONTAINING ALL WATER TILES IN EACH LAYER
var waterListTemp // 2D ARRAY OF PROCESSED WATER TILES IN EACH LAYER
var rainRate = 0 // WATER SPAWN CHANCE

var stoneFormation = new Image()

function startup() {
	mapCanvas = document.getElementById("mapCanvas")
	mapDraw = mapCanvas.getContext("2d")
	stoneFormation.onload = function() {
		newMap()}
	stoneFormation.src = "/resources/textures/stone_formation.png"
}

function newMap() {
	stoneFormation = createImageData(stoneFormation) // RECEIVE DATA FROM IMAGE
	populateMap()
	drawMap()
	window.setInterval(process, tickrate)
}

function populateMap() {
	tileMap = []
	drawList = []
	waterList = []
	waterListTemp = []
	for (var i = 0; i < size.y; i++) {
		waterList.push([]) // PREPARE EMPTY WATER LIST
		waterListTemp.push([])
	}
	for (var a = 0; a < size.x; a++) {
		tileMap.push([]) // PREPARE EMPTY TILE MAP
		for (var b = 0; b < size.y; b++) {
			tileMap[a].push({ // FILL WITH AIR
				...air 
			})
			var i = b * 4 * size.x + a * 4
			if (stoneFormation.data[i] == 255) { // TURN IMAGE INTO STONE
				tileMap[a][b].substance = "stone"
				drawList.push({
					x: a, y: b
				})
			}
		}
	}
}

function drawMap() {
	var tile = {
		// SIZE OF EACH TILE IN PX
		x: Math.floor(mapCanvas.width/size.x),
		y: Math.floor(mapCanvas.height/size.y)
	}
	while (drawList.length > 0) {
		var pos = drawList.pop()
		if (tileMap[pos.x][pos.y].substance == "air") {
			mapDraw.clearRect(pos.x*tile.x, pos.y*tile.y, tile.x, tile.y)
		} else {
			if (tileMap[pos.x][pos.y].substance == "stone") {
				mapDraw.fillStyle = "hsl(0,50%,70%)"
			} else {
				var blue = tileMap[pos.x][pos.y].blue
				var green = tileMap[pos.x][pos.y].green
				mapDraw.fillStyle = "rgb(140,"+blue+","+green+")"
			}
			mapDraw.fillRect(pos.x*tile.x, pos.y*tile.y, tile.x, tile.y)
		}
	}
}

function stepMap() {
	for (var a = size.y-1; a >= 0; a--) {
		// CHECK BOTTOM LAYER UP
		while (waterList[a].length > 0) {
			// PROCESS EACH WATER TILE
			var b = Math.floor(Math.random()*waterList[a].length) // SELECT A RANDOM WATER TILE ON LAYER
			var pos = {
				x: waterList[a][b],
				y: a
			}
			var move = checkMove(pos, "air") // GET THE MOST DOWNWARD POSSIBLE MOVE
			if (move == false) {
				// IF WATER GOES TO THE VOID
				tileMap[pos.x][pos.y] = {...air} // REPLACE WITH AIR
				drawList.push(pos) // DRAW OVER OLD POSITION
			} else {
				if (move.x == 0 && move.y == 0){ // IF THERE'S NO AVAILABLE MOVE
					move = checkMove(pos, "water") // SWAP WITH ANOTHER WATER TILE
					if (move.x != 0 || move.y != 0){ // IF THERE IS AN AVAILABLE SWAP
						waterListTemp[pos.y].push(pos.x)
						var newPos = exchange(pos, move, true) // SWAP WITH NEW TILE
						drawList.push(newPos) // DRAW OVER NEW POSITION
						drawList.push(pos) // DRAW OVER OLD POSITION
					} else { // IF THERE IS NO AVAILABLE MOVE OR SWAP
						waterListTemp[pos.y].push(pos.x)
					}
				} else { // IF THERE IS AN AVAILABLE MOVE
					var newPos = exchange(pos, move, false) // MOVE TO NEW TILE
					drawList.push(newPos) // DRAW OVER NEW POSITION
					drawList.push(pos) // DRAW OVER OLD POSITION
					waterListTemp[newPos.y].push(newPos.x) // READY WATER TO BE PROCESSED NEXT TICK
				}
			}
			waterList[a].splice(b, 1)
		}
	}
	for (var i = 0; i < size.y; i++) {
		waterList[i] = [...waterListTemp[i]]
		waterListTemp[i] = []
	}
	for (var i = 0; i < size.x; i++) {
		// THIS LOOP MAKES THE TOP LAYER PRODUCE WATER
		if (tileMap[i][0].substance == "air") {
			if (Math.random() < rainRate) {
				// IF THE ROLL SUCCEEDS
				tileMap[i][0].substance = "water" // SET THE TILE TO WATER
				tileMap[i][0].blue = 200 + Math.floor(Math.random() * 40) // GIVE IT A RANDOM COLOUR
				tileMap[i][0].green = 180 + Math.floor(Math.random() * 30)
				drawList.push({
					// READY IT TO BE DRAWN
					x: i, y: 0
				})
				waterList[0].push(i) // AND PROCESSED
			}
		}
	}
}

function process() {
	getRainRate()
	console.log(rainRate)
	stepMap()
	drawMap()
	time += 1
}

function checkMove(pos, substance) {
	var move = [
		[{x: 0,y: 1}],
		// DOWN IS THE PRIORITIZED DIRECTION
		[{x: 1,y: 1},
			{x: -1,y: 1}],
		// DIAGONAL IS THE SECOND
		[{x: 1,y: 0},
			{x: -1,y: 0}]]
				// SIDEWAYS IS THE LOWEST PRIORITY
	
	if (substance == "water") {
		move = [[
			{x:-1,y:-1},
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-1},
			{x:0,y:0},
			{x:0,y:1},
			{x:1,y:-1},
			{x:1,y:0},
			{x:1,y:1}]]
	} // WATER CAN SWAP IN ANY DIRECTION
	
	for (var a = 0; a < move.length; a++) {
		// CHECK THE DIRECTIONS IN ORDER OF PRIORITY
		while (move[a].length > 0) {
			var lastMove = tileMap[pos.x][pos.y].direction // PRIORITIZE MOVING IN THE SAME DIRECTION AS LAST TICK
			var b = move[a].findIndex((dir) => dir.x == lastMove.x && dir.y == lastMove.y)
			if (b == -1) {
				b = Math.floor(Math.random()*move[a].length) // RANDOMLY SELECT BETWEEN LEFT AND RIGHT
			}
			var currentMove = move[a][b]
			var newPos = {...pos}
			newPos.x += currentMove.x
			newPos.y += currentMove.y
			if (newPos.x >= 0 && newPos.x < size.x && newPos.y >= 0 && newPos.y < size.y) {
				// IS THE POSITION IN BOUNDS
				if (tileMap[newPos.x][newPos.y].substance == substance) {
					// IS THE POSITION VALID
					return currentMove
				}
			} else {
				// POSITION IS OUT OF BOUNDS
				return false // WATER GOES TO THE VOID
			}
			move[a].splice(b, 1) // REMOVE THIS OPTION
		}
	}
	return {x:0,y:0} // NO POSITION TO MOVE TO
}

function exchange(pos, move, swap) {
	var newPos = {...pos}
	newPos.x += move.x
	newPos.y += move.y
	var tileTemp = {
		...tileMap[newPos.x][newPos.y]}
	tileMap[newPos.x][newPos.y] = {
		...tileMap[pos.x][pos.y]}
	tileMap[pos.x][pos.y] = {
		...tileTemp
	}
	tileMap[newPos.x][newPos.y].direction = {...move}
	if (swap) {
		tileMap[pos.x][pos.y].direction.x = -move.x
		tileMap[pos.x][pos.y].direction.y = -move.y
	}
	return newPos
}

function getRainRate() {
	rainRate = 0.08 + Math.sin(time/100) / 12
	if (rainRate < 0) {
		rainRate = 0.001
	}
}
