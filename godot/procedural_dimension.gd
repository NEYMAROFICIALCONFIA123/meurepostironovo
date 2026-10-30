extends RefCounted
## Batched procedural environmental models, shared ground sampler and bounded worlds.
var w
var layout
var pools: Dictionary = {}

func part(kind: String,p: Vector3,size: Vector3,color: String,glow: bool=false) -> void:
	var key := kind+color+str(glow)
	if not pools.has(key): pools[key] = {"kind":kind,"color":color,"glow":glow,"transforms":[]}
	pools[key].transforms.append(Transform3D(Basis.IDENTITY.scaled(size),p))

func b(p: Vector3,size: Vector3,c: String) -> void: part("box",p,size,c)
func e(p: Vector3,size: Vector3,c: String) -> void: part("box",p,size,c,true)
func sphere(p: Vector3,size: Vector3,c: String) -> void: part("sphere",p,size,c)
func cylinder(p: Vector3,r: float,h: float,c: String) -> void: part("cyl",p,Vector3(r,h,r),c)

func render(plan,world,story: bool=true) -> Dictionary:
	w = world
	layout = plan
	pools.clear()
	if layout.stage==2:
		for j in range(layout.nz):
			for i in range(layout.nx):
				var p := layout.origin+Vector2(-layout.half_x+i*2+1,-layout.half_z+j*2+1)
				var y: float = layout.ground_at(p)
				b(Vector3(p.x,y-0.6,p.y),Vector3(2,1.2,2),"#806347")
				b(Vector3(p.x,y-0.035,p.y),Vector3(2,0.07,2),"#6d9b50" if (i+j)%3 else "#7da659")
	else:
		var tool := SurfaceTool.new()
		tool.begin(Mesh.PRIMITIVE_TRIANGLES)
		var color := Color(["626974","bbcbd1","6d9955","7b9cae","7c8880","35445b"][layout.stage])
		for j in range(layout.nz):
			for i in range(layout.nx):
				# Same diagonal split as world_layout.gd.ground_at().
				for offset: Vector2i in [Vector2i(0,0),Vector2i(1,0),Vector2i(0,1),Vector2i(1,0),Vector2i(1,1),Vector2i(0,1)]:
					var x: float = layout.origin.x-layout.half_x+(i+offset.x)*2
					var z: float = layout.origin.y-layout.half_z+(j+offset.y)*2
					var c := color
					if layout.stage==3: c = Color(["b19bd2","7cb7c5","c6ae88"][(i+j)%3])
					elif layout.reserved(Vector2(x,z)): c *= 0.65 if layout.stage==0 else 1.06
					tool.set_color(c)
					tool.add_vertex(Vector3(x,layout.heights[j+offset.y][i+offset.x],z))
		tool.generate_normals()
		var terrain: MeshInstance3D = w.shape(tool.commit(),Vector3.ZERO,"#ffffff")
		var material := StandardMaterial3D.new()
		material.vertex_color_use_as_albedo = true
		material.roughness = 0.9
		terrain.material_override = material
	for z in range(-layout.half_z+2,layout.half_z-2,2):
		if layout.stage==0: b(Vector3(layout.origin.x,0.012,z+layout.origin.y),Vector3(0.09,0.015,0.7),"#d9c5a0")
		elif layout.stage==1: b(Vector3(layout.origin.x,0.015,z+layout.origin.y),Vector3(1.3,0.035,1.1),"#98aeb3")
		elif layout.stage==5: e(Vector3(layout.origin.x,0.02,z+layout.origin.y),Vector3(0.045,0.025,1.1),"#89bcba")
	for p in layout.props: render_prop(p)
	if layout.stage==4:
		b(Vector3(layout.origin.x,6.1,layout.origin.y),Vector3(24,0.25,36),"#87988b")
		for z in range(-14,17,4):
			for x: int in [-5,5]: e(Vector3(layout.origin.x+x,5.68,layout.origin.y+z),Vector3(3,0.08,0.2),"#d4e3d1")
	flush()
	return make_actors() if story else {}

func render_prop(p: Dictionary) -> void:
	var x: float = p.x
	var y: float = p.y
	var z: float = p.z
	var variant: int = p.variant
	var shade: String = ["#4c6374","#566976","#655f6b","#425e65"][variant%4]
	match p.kind:
		"building","tower":
			var h: float = p.h
			b(Vector3(x,y+h/2,z),Vector3(p.w,h,p.d),"#35455e" if p.kind=="tower" else shade)
			b(Vector3(x,y+0.35,z),Vector3(p.w+0.25,0.7,p.d+0.25),"#778389")
			b(Vector3(x,y+h+0.1,z),Vector3(p.w+0.28,0.24,p.d+0.28),"#a1a3a2")
			b(Vector3(x,y+h+0.5,z),Vector3(p.w*0.55,0.9+variant%3*1.4,p.d*0.5),"#61737b")
			for row in range(int(h/1.7)-1):
				for col in range(3):
					for side: int in [-1,1]:
						var pos := Vector3(x+(col-1)*p.w*0.26,y+1.5+row*1.7,z+side*(p.d/2+0.018))
						b(pos,Vector3(0.42,0.75,0.04),"#25394b")
						if (row+col+variant)%4: e(pos+Vector3(0,0,side*0.026),Vector3(0.33,0.62,0.018),"#a6bec7" if (row+variant)%3 else "#ecd1a0")
		"pine":
			cylinder(Vector3(x,y+p.h*0.35,z),0.15,p.h*0.7,"#706154")
			for j in range(5):
				var r: float = p.h*0.28*(1-j*0.15)
				part("cone",Vector3(x,y+p.h*0.35+j*p.h*0.12,z),Vector3(r,p.h*0.43,r),"#476a68" if j%2 else "#5c7a76")
				part("cone",Vector3(x,y+p.h*0.39+j*p.h*0.12,z),Vector3(r*0.86,p.h*0.3,r*0.86),"#c4d6d8")
		"oak":
			b(Vector3(x,y+1.5,z),Vector3(0.65,3,0.65),"#70583c")
			for j in range(3): b(Vector3(x+sin(variant+j)*0.4,y+2.8+j*0.65,z+cos(variant+j)*0.4),Vector3(3-j*0.45,1.1,3-j*0.45),["#507e45","#679552","#7aa55d"][j])
		"boulder":
			sphere(Vector3(x,y+0.5,z),Vector3(1+p.h*0.12,0.65,1.1),"#93a6ac")
			sphere(Vector3(x+0.2,y+0.8,z),Vector3(0.7,0.15,0.7),"#d0dfe0")
		"pavilion":
			for sx: int in [-1,1]:
				for sz: int in [-1,1]: cylinder(Vector3(x+sx*0.8,y+1.5,z+sz*0.8),0.09,3,"#d3c4a4")
			b(Vector3(x,y+3.05,z),Vector3(2.2,0.3,2.2),["#a88cc9","#7fbec5","#d4b67f"][variant%3])
			b(Vector3(x,y+0.12,z),Vector3(2.2,0.22,2.2),"#b7c7d3")
		"pillar":
			cylinder(Vector3(x,y+p.h/2,z),0.45,p.h,"#9cb6ca")
			b(Vector3(x,y+0.2,z),Vector3(1.2,0.4,1.2),"#c5d0d6")
		"machine":
			b(Vector3(x,y+1,z),Vector3(1.4,2,1.4),"#526e6b")
			b(Vector3(x,y+1.3,z+0.72),Vector3(1,0.7,0.04),"#293d42")
			e(Vector3(x,y+1.3,z+0.75),Vector3(0.88,0.52,0.02),"#93c4b6")
			for j in range(3): cylinder(Vector3(x+(j-1)*0.32,y+2.35,z),0.1,0.6,"#98b6ac")
		"storage","cabinet":
			var h: float = 2.05 if p.kind=="cabinet" else 1.4+variant*0.08
			b(Vector3(x,y+h/2,z),Vector3(p.w,h,p.d),"#738d80" if p.kind=="cabinet" else shade)
			for j in range(3): b(Vector3(x,y+0.48+j*0.45,z+p.d/2+0.035),Vector3(p.w*0.25,0.045,0.04),"#b9c7bd")
		"conduit":
			b(Vector3(x,y+0.8,z),Vector3(2.2,1.6,2.2),"#4f6575")
			for i in range(3): e(Vector3(x,y+0.4+i*0.4,z+1.11),Vector3(1.5,0.06,0.025),"#9cc5c0")
		"streetlamp":
			cylinder(Vector3(x,y+1.8,z),0.06,3.6,"#7b8e9c")
			b(Vector3(x,y+3.65,z),Vector3(0.45,0.15,0.35),"#9ba9af")
			e(Vector3(x,y+3.56,z),Vector3(0.33,0.06,0.25),"#f5d8a3")
		"rune":
			b(Vector3(x,y+0.65,z),Vector3(0.42,1.3,0.4),"#7b969b")
			e(Vector3(x,y+0.8,z+0.21),Vector3(0.08,0.55,0.018),"#a4d8e1")
		"railpost": cylinder(Vector3(x,y+0.6,z),0.05,1.2,"#b3c8d4")
		"neonpost":
			b(Vector3(x,y+1,z),Vector3(0.18,2,0.18),"#6f8a9d")
			e(Vector3(x,y+1.1,z+0.11),Vector3(0.06,1.4,0.025),"#a1cac4")
		"bottle": cylinder(Vector3(x,y+2.35,z),0.12,0.45,"#a8c9c0")
		"flower":
			b(Vector3(x,y+0.15,z),Vector3(0.07,0.3,0.07),"#5d8a4a")
			b(Vector3(x,y+0.34,z),Vector3(0.25,0.16,0.25),"#dac680" if variant%2 else "#c597b5")
		"terminal":
			b(Vector3(x,y+0.7,z),Vector3(0.45,1.4,0.45),"#5b7383")
			e(Vector3(x,y+1.05,z+0.24),Vector3(0.28,0.3,0.02),"#b6a7cf")
		"stud": cylinder(Vector3(x,y+0.05,z),0.13,0.1,"#b6c7d4")
		_: sphere(Vector3(x,y+0.09,z),Vector3(0.3,0.12,0.28),"#bccfd1")

func flush() -> void:
	for pool: Dictionary in pools.values():
		var geo: Mesh
		if pool.kind=="box":
			var box := BoxMesh.new()
			box.size = Vector3.ONE
			geo = box
		elif pool.kind=="sphere":
			var ball := SphereMesh.new()
			ball.radius = 1
			ball.height = 2
			ball.radial_segments = 14
			ball.rings = 10
			geo = ball
		else:
			var cyl := CylinderMesh.new()
			cyl.top_radius = 0 if pool.kind=="cone" else 1
			cyl.bottom_radius = 1
			cyl.height = 1
			cyl.radial_segments = 12
			geo = cyl
		var multi := MultiMesh.new()
		multi.transform_format = MultiMesh.TRANSFORM_3D
		multi.mesh = geo
		multi.instance_count = pool.transforms.size()
		for i in range(pool.transforms.size()): multi.set_instance_transform(i,pool.transforms[i])
		var node := MultiMeshInstance3D.new()
		node.multimesh = multi
		node.material_override = w.material(pool.color,pool.glow)
		w.root.add_child(node)

func make_actors() -> Dictionary:
	var actors: Dictionary = {}
	match layout.stage:
		0:
			actors.hero = w.humanoid("spider",Vector3(-2.7,3,-6))
			w.beam(Vector3(-2,18,-10),Vector3(-2.7,5,-6),"#d5e3ee")
		1: actors.hero = w.humanoid("war",Vector3(-2.3,0,-2.8))
		2:
			var creature: Node3D = w.group(Vector3(-2,0,-3))
			w.block(Vector3(0,1.45,0),Vector3(0.63,0.65,0.62),"#6d9c47",creature)
			w.block(Vector3(0,0.7,0),Vector3(0.43,0.87,0.4),"#5a813d",creature)
			for side: int in [-1,1]:
				w.block(Vector3(side*0.25,0.19,0.07),Vector3(0.27,0.38,0.65),"#527337",creature)
				w.block(Vector3(side*0.17,1.52,0.32),Vector3(0.13,0.15,0.02),"#182e23",creature)
			w.block(Vector3(0,1.3,0.32),Vector3(0.22,0.15,0.02),"#182e23",creature)
			actors.creeper = creature
		3: actors.hero = w.humanoid("roblox",Vector3(-1.4,0,-3))
		4:
			actors.rick = w.humanoid("rick",Vector3(-1.7,0,-4.1))
			actors.morty = w.humanoid("morty",Vector3(0.2,0,-5))
			w.portal(Vector3(-6,2.5,-16),"#87eb54")
			actors.cage = w.group(Vector3(0,1.7,1))
			for i in range(4):
				w.block(Vector3(-1.1+i*0.73,0,0),Vector3(0.035,2.1,0.035),"#8cf77c",actors.cage)
				w.block(Vector3(0,-1.05+i*0.7,0),Vector3(2.2,0.035,0.035),"#8cf77c",actors.cage)
			actors.beam = w.beam(Vector3(-1,1.2,-4),Vector3(0,1.7,1),"#92ef77")
			var light := OmniLight3D.new()
			light.position = Vector3(0,4,-5)
			light.light_color = Color("d2dacd")
			light.light_energy = 3
			light.omni_range = 26
			w.root.add_child(light)
		5:
			actors = w.make_puppet()
	var portal: Vector2 = layout.portal_position
	actors.portal = w.portal(Vector3(portal.x,2+layout.ground_at(portal),portal.y),"#8eee54" if layout.stage==4 else ("#db79d3" if layout.stage==5 else "#8bd8ff"))
	return actors
