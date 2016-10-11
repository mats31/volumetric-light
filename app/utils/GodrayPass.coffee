Stage3d = require('core/Stage3d')
Texture = require('core/Texture')
StageRenderer = require('core/StageRenderer')

class GodrayPass extends WAGNER.Pass

	colors = {}

	constructor:(@renderer,w,h)->

		super()

		@width = w = w || window.innerWidth/4
		@height = h = h || window.innerHeight/4

		@occlusion = {}
		@registered = []

		@occlusion.scene = new THREE.Scene()

		@occlusion.texture = @getOfflineTexture( w, h, false )
		@occlusion.texture.stencilBuffer = false
		@occlusion.texture.depthBuffer = false

		@occlusion.texture2 = @getOfflineTexture( w, h, false )
		@occlusion.texture2.stencilBuffer = false
		@occlusion.texture2.depthBuffer = false

		@propertyColor = 'occlusionColor'

		@composer = new WAGNER.Composer( @renderer )
		@composer.setSize( @width, @height )

		@godrayPass = new WAGNER.Pass()
		@godrayPass.shader = WAGNER.processShader( WAGNER.basicVs, require('postprocess/godray-fs.glsl') )
		@godrayPass.mapUniforms( @godrayPass.shader.uniforms )

		@blendPass = new WAGNER.BlendPass()
		@blendPass.params.resolution2.set(@width, @height)

		@params.clearColor = 0x000000
		@params.exposure = .05
		@params.decay = 1
		@params.density = 0.2
		@params.weight = .45
		@params.opacity = .65
		@params.blendMode = WAGNER.BlendMode.Screen
		@params.lightPositionOnScreen = new THREE.Vector2(1,2)

		return

	add:(o)->
		@occlusion.scene.add(o)
		return

	remove:(o)->
		@occlusion.scene.remove(o)
		return

	isLoaded:()->
		@loaded = @blendPass.isLoaded()
		return @loaded

	register:(object3D,color)->
		@registered.push({object3D:object3D, color:color, parent:object3D.parent, material:object3D.material})
		return

	run:(c)->
		# blend with the normal stuffs
		@blendPass.params.mode = @params.blendMode
		@blendPass.params.sizeMode = 1
		@blendPass.params.tInput2 = @occlusion.texture2
		@blendPass.shader.uniforms.resolution2.value.set( @width, @height )
		@blendPass.params.aspectRatio = c.read.width / c.read.height
		@blendPass.params.aspectRatio2 = @width/@height
		@blendPass.params.opacity = @params.opacity
		c.pass(@blendPass)
		return

	renderOcclusion:(scene)->
		# Switch the material
		objects = [];
		for o in @registered
			object3D = o.object3D
			objects.push(o)
			m =  @getMaterialColor(o.color)

			if(object3D instanceof THREE.Mesh)
				object3D.material = m
			else
				object3D.switchToOcclusion( m )

			@occlusion.scene.add(object3D)
			object3D.position.add(o.parent.position)

		@composer.renderer.autoClear = false
		@composer.renderer.setRenderTarget(@composer.write)
		@composer.reset()
		@composer.setSize(@width,@height)
		@composer.renderer.setClearColor(@params.clearColor,1)
		@composer.renderer.clear()
		@composer.render(@occlusion.scene, @camera)
		@composer.toTexture(@occlusion.texture)
		# @composer.render(@occlusion.scene, @camera, true, @occlusion.texture)

		@godrayPass.params.exposure 				= @params.exposure
		@godrayPass.params.decay 					= @params.decay
		@godrayPass.params.density 					= @params.density
		@godrayPass.params.weight 					= @params.weight
		@godrayPass.params.lightPositionOnScreen 	= @params.lightPositionOnScreen
		@godrayPass.params.occlusionTexture 		= @occlusion.texture

		@composer.pass( @godrayPass )
		@composer.toTexture(@occlusion.texture)
		@composer.toTexture(@occlusion.texture2)

		for i in [objects.length-1..0] by -1
			o = objects[i]
			object3D = o.object3D

			if( object3D instanceof THREE.Mesh )
				object3D.material = o.material
			else
				object3D.switchToNormal()

			o.parent.add(object3D)
			object3D.position.sub(o.parent.position)

		return

	initGui:(gui, name='godray')->
		f = gui.addFolder(name)
		f.add(@params,'exposure',0,10).listen()
		f.add(@params,'decay',0,10).listen()
		f.add(@params,'density',0,10).listen()
		f.add(@params,'weight',0,1).listen()
		f.add(@params,'opacity',0,1).listen()
		f.add(@params,'blendMode',1,24).step(1).listen()
		f.add(@params.lightPositionOnScreen,'x',0,2).listen()
		f.add(@params.lightPositionOnScreen,'y',0,2).listen()
		f.addColor(@params,'clearColor')
		# f.open()
		return

	initDebug:()->
		# Debug render 1
		geo = new THREE.PlaneBufferGeometry( window.innerWidth/window.innerHeight, 1, 1, 1 )

		material = new THREE.MeshBasicMaterial({color:0xFFFFFF,map:@occlusion.texture2})
		@debugMesh1 = new THREE.Mesh( geo, material )
		Stage3d.add(@debugMesh1)

		# Debug render 2
		material2 = new THREE.MeshBasicMaterial({color:0xFFFFFF})
		@debugMesh2 = new THREE.Mesh( geo, material2 )
		Stage3d.add(@debugMesh2)

		StageRenderer.onUpdate.add(()=>
			# Stage3d.camera.rotation.normalize()
			@debugMesh1.position.copy(Stage3d.camera.position)
			@debugMesh1.position.x += Stage3d.camera.rotation.x * 1
			@debugMesh1.position.y += Stage3d.camera.rotation.y * 1
			@debugMesh1.position.z += -9#Stage3d.camera.rotation.z * 1
			@debugMesh1.lookAt(Stage3d.camera.position)
		)

		return


	getMaterialColor:(color)->
		if(!colors[color])
			colors[color] = new THREE.MeshBasicMaterial({color:color})
		return colors[color]

module.exports = GodrayPass
