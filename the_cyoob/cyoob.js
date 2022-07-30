function webglStart() {
	var pos, cubeTexture = "textures/grass_cube.jpg"
	var cyoob = new PhiloGL.O3D.Cube({
		//colors: [1,0,0,1],
		textures: cubeTexture,
		texCoords: UVmap.cube
	})
	
function grab(e) {
	pos = {
		x: e.x,
		y: e.y
	}
}
	
function drag(e) {
	cyoob.rotation.y -= (pos.x - e.x)/100
	cyoob.rotation.x -= (pos.y - e.y)/100
	cyoob.update()
	pos.x = e.x
	pos.y = e.y
}
	
	PhiloGL('glCanvas', {
		camera: {
			position:{
				x: 0, y: 0, z: -7
			}
		},
		textures: {
			src: [cubeTexture]
		},
		events: {
			onDragStart: function(e) {grab(e)},
			onDragMove: function(e) {drag(e)},
			onTouchStart: function(e) {grab(e)},
			onTouchMove: function(e) {drag(e)}
		},
		onError: function() {
			alert("The app ain't built right")
		},
		onLoad: function(app) {
			var gl = app.gl,
				program = app.program,
				scene = app.scene,
				canvas = app.canvas,
				camera = app.camera,
				lighting = true,
				ambient = {
					r: 0.0,
					g: 0.0,
					b: 0.0
				},
				direction = {
        	x: 0.0,
					y: 0.0,
      		z: 0.0,
          r: 0.0,
          g: 0.0,
          b: 0.0
        }
        
  		gl.clearColor(0.0,0.0,0.0,1.0)
  		gl.clearDepth(1.0)
  		gl.enable(gl.DEPTH_TEST)
  		gl.depthFunc(gl.LEQUAL)
  		gl.viewport(0, 0, +canvas.width, +canvas.height)
  		scene.add(cyoob)
  		draw()
  		
  		function draw() {
  			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  			
  			var lights = scene.config.lights
  			lights.enable = lighting.checked
  			lights.ambient = {
  				r: +ambient.r.value,
  				g: +ambient.g.value,
  				b: +ambient.b.value
  			}
  			lights.directional = {
  				color: {
  					r: +direction.r.value,
  					g: +direction.r.value,
  					b: +direction.b.value
  				},
  				direction: {
  					x: +direction.x.value,
  					y: +direction.y.value,
  					z: +direction.z.value
  				}
  			}
  			scene.render()
  			PhiloGL.Fx.requestAnimationFrame(draw)
  		}
		}
	})
}
