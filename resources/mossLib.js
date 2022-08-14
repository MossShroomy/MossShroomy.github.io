// A COLLECTION OF USEFUL FUNCTIONS

function createImageData(img) {
	var canvas = document.createElement("canvas")
	canvas.width = img.width
	canvas.height = img.height
	canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height)
	return canvas.getContext("2d").getImageData(0,0,img.width,img.height)
}