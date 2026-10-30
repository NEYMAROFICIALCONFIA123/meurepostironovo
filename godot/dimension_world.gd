extends Node3D
## Real 3D first-person sets. Procedural meshes, lights and volumetric characters.
var camera: Camera3D
var root: Node3D
var scene_index := -1
var actors: Dictionary = {}
var palette: Dictionary = {}
var gaze := Vector2.ZERO
var walk := Vector2.ZERO

func material(color: String, glow: bool=false) -> StandardMaterial3D:
	var key := color+str(glow)
	if palette.has(key): return palette[key]
	var result := StandardMaterial3D.new()
	result.albedo_color = Color(color)
	result.roughness = 0.72
	if glow:
		result.emission_enabled = true
		result.emission = Color(color)
		result.emission_energy_multiplier = 1.5
	palette[key] = result
	return result

func shape(geo: Mesh,pos: Vector3,color: String,parent: Node3D=null,glow: bool=false) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	node.mesh = geo
	node.material_override = material(color,glow)
	node.position = pos
	(parent if parent!=null else root).add_child(node)
	return node

func block(pos: Vector3,size: Vector3,color: String,parent: Node3D=null,glow: bool=false) -> MeshInstance3D:
	var geo := BoxMesh.new()
	geo.size = size
	return shape(geo,pos,color,parent,glow)

func cylinder(pos: Vector3,rt: float,rb: float,height: float,color: String,parent: Node3D=null,sides: int=12) -> MeshInstance3D:
	var geo := CylinderMesh.new()
	geo.top_radius = rt
	geo.bottom_radius = rb
	geo.height = height
	geo.radial_segments = sides
	return shape(geo,pos,color,parent)

func ball(pos: Vector3,radius: float,color: String,parent: Node3D=null) -> MeshInstance3D:
	var geo := SphereMesh.new()
	geo.radius = radius
	geo.height = radius*2
	geo.radial_segments = 12
	geo.rings = 6
	return shape(geo,pos,color,parent)

func beam(a: Vector3,b: Vector3,color: String,parent: Node3D=null) -> MeshInstance3D:
	var node := cylinder((a+b)/2,0.018,0.018,a.distance_to(b),color,parent,8)
	node.quaternion = Quaternion(Vector3.UP,(b-a).normalized())
	return node

func group(pos: Vector3) -> Node3D:
	var node := Node3D.new()
	node.position = pos
	root.add_child(node)
	return node

func portal(pos: Vector3,color: String) -> Node3D:
	var node := group(pos)
	for i in range(3):
		var geo := TorusMesh.new()
		geo.inner_radius = 1.2+i*0.1
		geo.outer_radius = 1.27+i*0.1
		geo.rings = 40
		geo.ring_segments = 8
		var ring := shape(geo,Vector3.ZERO,color,node,true)
		ring.rotation.x = PI/2
		ring.scale.z = 1.3
	var light := OmniLight3D.new()
	light.light_color = Color(color)
	light.light_energy = 3
	light.omni_range = 8
	node.add_child(light)
	return node

func humanoid(kind: String,pos: Vector3) -> Node3D:
	if kind!="roblox": return preload("res://premium_models.gd").humanoid(kind,pos,self)
	var node := group(pos)
	var skin := "#c13e53" if kind=="spider" else ("#b9b3ab" if kind=="war" else "#dec19e")
	var shirt: String = {"rick":"#e3ecea","morty":"#e7c34e","spider":"#b52f48","war":"#aea79d","roblox":"#477ace"}[kind]
	var pants: String = {"rick":"#665b4e","morty":"#415e88","spider":"#223d70","war":"#403c40","roblox":"#6eae59"}[kind]
	block(Vector3(0,1.23,0),Vector3(0.66,0.85,0.38),shirt,node)
	for side: int in [-1,1]:
		block(Vector3(side*0.2,0.4,0),Vector3(0.23,0.76,0.26),pants,node)
		block(Vector3(side*0.2,0.08,0.09),Vector3(0.28,0.17,0.45),"#333344",node)
		block(Vector3(side*0.48,1.25,0),Vector3(0.21,0.78,0.24),shirt if kind=="rick" else skin,node)
		ball(Vector3(side*0.48,0.83,0),0.12,skin,node)
	block(Vector3(0,1.97,0),Vector3(0.45,0.55,0.43),skin,node)
	for side: int in [-1,1]: block(Vector3(side*0.115,2.04,0.223),Vector3(0.1,0.065,0.02),"#f4f0e6" if kind=="spider" else "#242633",node)
	block(Vector3(0,1.84,0.224),Vector3(0.16,0.027,0.02),"#59474b",node)
	if kind=="rick":
		for i in range(9):
			var spike := cylinder(Vector3(cos(i*PI/8)*0.29,2.25+sin(i*PI/8)*0.18,0),0,0.16,0.48,"#9ecbdc",node,4)
			spike.rotation.z = -cos(i*PI/8)*0.7
		block(Vector3(0,1.26,0.21),Vector3(0.22,0.75,0.035),"#73bab5",node)
		block(Vector3(0.66,1.2,0.14),Vector3(0.52,0.19,0.24),"#a7b4a3",node)
		block(Vector3(0.86,1.21,0.27),Vector3(0.16,0.1,0.04),"#93ed53",node,true)
	elif kind=="morty": block(Vector3(0,2.23,0),Vector3(0.48,0.15,0.45),"#654632",node)
	elif kind=="war":
		block(Vector3(0.08,2.02,0.225),Vector3(0.085,0.53,0.022),"#a54445",node)
		block(Vector3(0,1.78,0.225),Vector3(0.42,0.16,0.05),"#55433c",node)
		block(Vector3(0,0.84,0),Vector3(0.73,0.25,0.45),"#554434",node)
		cylinder(Vector3(0.75,1.12,0),0.035,0.035,1.6,"#65442d",node)
		block(Vector3(0.93,1.77,0),Vector3(0.55,0.48,0.11),"#93c6d4",node).rotation.z = 0.22
		block(Vector3(0.96,1.77,0.062),Vector3(0.16,0.27,0.02),"#85dbf5",node,true)
	elif kind=="spider":
		block(Vector3(0,1.25,0.2),Vector3(0.17,0.23,0.02),"#25324b",node)
		beam(Vector3(-0.22,1.65,0.2),Vector3(0.22,1,0.2),"#25324b",node)
	return node

func build(index: int) -> void:
	if root: root.free()
	palette.clear()
	actors.clear()
	scene_index = index
	gaze = Vector2.ZERO
	walk = Vector2.ZERO
	root = Node3D.new()
	add_child(root)
	camera = Camera3D.new()
	camera.fov = 64
	camera.near = 0.08
	root.add_child(camera)
	camera.current = true
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(["23344d","90adba","91c4d8","9daace","363e45","141b30"][index])
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("b9d1df")
	env.ambient_light_energy = 0.65
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	var environment := WorldEnvironment.new()
	environment.environment = env
	root.add_child(environment)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55,-30,0)
	sun.light_color = Color("fff0d7")
	sun.light_energy = 1.6
	sun.shadow_enabled = true
	root.add_child(sun)
	for side: int in [-1,1]:
		block(Vector3(side*0.39,-0.43,-0.7),Vector3(0.13,0.22,0.19),"#d9bda3",camera)
		block(Vector3(side*0.42,-0.61,-0.65),Vector3(0.18,0.25,0.22),"#344b70",camera)
	match index:
		0: city()
		1: snow()
		2: voxels()
		3: obby()
		4: garage()
		5: cyber()
	preload("res://premium_models.gd").enrich(index,self)
	actors.portal = portal(Vector3(3.7 if index==4 else 3.4,2,-9),"#8eee54" if index==4 else ("#db79d3" if index==5 else "#8bd8ff"))

func city() -> void:
	block(Vector3(0,-0.3,8),Vector3(13,0.6,18),"#48505e")
	block(Vector3(0,0.08,2),Vector3(13,0.2,0.4),"#a6a2a1")
	for side: int in [-1,1]:
		block(Vector3(side*6.2,0.35,8),Vector3(0.25,0.7,18),"#676d78")
		for z in range(5):
			var h := 9+(z*7+side*3+30)%12
			var x := side*(10+z%2*2)
			block(Vector3(x,h/2.0-8,-z*14-9),Vector3(9,h,10),"#35475c" if z%2 else "#3b3c52")
			for row in range(int(h/1.1)-1):
				for col in range(5): block(Vector3(x-3.3+col*1.6,row*1.1-6.5,-z*14-3.94),Vector3(0.53,0.63,0.045),"#647f91" if (row+col+z)%4 else "#ffcb8c",null,true)
	block(Vector3(0,-8.05,-25),Vector3(8,0.1,90),"#252d3d")
	for i in range(12): block(Vector3(0,-7.96,-i*6),Vector3(0.12,0.02,2.7),"#ebc589")
	actors.hero = humanoid("spider",Vector3(-2.7,3,-6))
	beam(Vector3(-2,18,-10),Vector3(-2.7,5,-6),"#d5e3ee")

func snow() -> void:
	block(Vector3(0,-0.2,-12),Vector3(70,0.4,80),"#c5d4d8")
	for i in range(18):
		var x := (1 if i%2 else -1)*(12+i*7%24)
		var z := -8-int(i/2.0)*9
		var h := 10+i*11%14
		cylinder(Vector3(x,h/2.0-0.1,z),0,7,h,"#6d8590" if i%2 else "#879da7",null,5)
		cylinder(Vector3(x,h*0.82,z),0,2.6,h*0.36,"#e5edf0",null,5)
	for i in range(22):
		var x := (1 if i%2 else -1)*(5+i%4*1.6)
		var z := -i*3
		block(Vector3(x,1.5,z),Vector3(0.3,3,0.3),"#515d60")
		for j in range(3): cylinder(Vector3(x,2+j*0.65,z),0,1.1-j*0.24,1.7,"#526d70",null,5)
	for side: int in [-1,1]:
		block(Vector3(side*3.3,3,-13),Vector3(1.5,6,1.4),"#6c7e85")
		for i in range(5): block(Vector3(side*3.3,1+i*0.8,-12.28),Vector3(0.15,0.4,0.03),"#88d4e5",null,true)
	block(Vector3(0,6,-13),Vector3(8,0.9,1.8),"#6c7e85")
	actors.hero = humanoid("war",Vector3(-2.3,0,-2.8))

func voxels() -> void:
	# Single instanced draw for the soil, followed by instanced green caps.
	for layer in range(2):
		var geo := BoxMesh.new()
		geo.size = Vector3(1,1 if layer==0 else 0.08,1)
		var multi := MultiMesh.new()
		multi.transform_format = MultiMesh.TRANSFORM_3D
		multi.mesh = geo
		multi.instance_count = 1024
		var n := 0
		for x in range(-16,16):
			for z in range(-24,8):
				var h := 0.1 if x>6 and z<-3 else (0.55 if sin(x*0.4)+cos(z*0.3)>0.6 else 0.0)
				multi.set_instance_transform(n,Transform3D(Basis.IDENTITY,Vector3(x,h-0.5 if layer==0 else h+0.025,z)))
				n += 1
		var node := MultiMeshInstance3D.new()
		node.multimesh = multi
		node.material_override = material("#88623f" if layer==0 else "#74ad4c")
		root.add_child(node)
	for p: Vector2 in [Vector2(-5,-4),Vector2(6,-10),Vector2(-8,-14),Vector2(8,-20),Vector2(-3,-22)]:
		block(Vector3(p.x,1.5,p.y),Vector3(0.7,3,0.7),"#6c4d30")
		for y in range(2): block(Vector3(p.x,3+y*0.8,p.y),Vector3(3-y*0.6,1,3-y*0.6),"#529548" if y else "#3b7738")
	block(Vector3(10,0.18,-11),Vector3(7,0.05,15),"#4f9fb9")
	for i in range(6): block(Vector3((i%3-1)*10,12+i%2*3,-i*11),Vector3(6,1.2,2.5),"#edf5f3")
	var creature := group(Vector3(-2,0,-3))
	block(Vector3(0,1.45,0),Vector3(0.63,0.65,0.62),"#6d9c47",creature)
	block(Vector3(0,0.7,0),Vector3(0.43,0.87,0.4),"#5a813d",creature)
	for side: int in [-1,1]:
		block(Vector3(side*0.25,0.19,0.07),Vector3(0.27,0.38,0.65),"#527337",creature)
		block(Vector3(side*0.17,1.52,0.32),Vector3(0.13,0.15,0.02),"#182e23",creature)
	block(Vector3(0,1.3,0.32),Vector3(0.22,0.15,0.02),"#182e23",creature)

func obby() -> void:
	var colors := ["#a58cda","#74c7d3","#efbc72"]
	for i in range(15):
		var x := sin(i*0.9)*3
		var z := 8-i*3.4
		var y := maxf(0,i-2)*0.12
		block(Vector3(x,y-0.3,z),Vector3(3,0.6,2.8),colors[i%3])
		block(Vector3(x,y+0.035,z),Vector3(2.8,0.08,2.6),"#bed4df")
	for i in range(7):
		var cloud := ball(Vector3((1 if i%2 else -1)*(9+i),-7-i%3,-i*9),4,"#e4e8f3")
		cloud.scale = Vector3(2,0.3,1)
	actors.hero = humanoid("roblox",Vector3(-1.4,0.4,-3))
	for side: int in [-1,1]: block(Vector3(side*2.2,2,-9),Vector3(0.3,4,0.3),"#e9d8a9")
	block(Vector3(0,4,-9),Vector3(4.7,0.3,0.3),"#e9d8a9")

func garage() -> void:
	block(Vector3(0,-0.16,-2),Vector3(18,0.3,20),"#7f8178")
	block(Vector3(0,3,-9),Vector3(18,6,0.35),"#79867b")
	for side: int in [-1,1]: block(Vector3(side*8.8,3,0),Vector3(0.3,6,28),"#5f706d")
	block(Vector3(0,6,0),Vector3(18,0.2,28),"#859188")
	block(Vector3(0,1,-7.7),Vector3(14,1.8,1.5),"#69756b")
	block(Vector3(0,1.99,-7.7),Vector3(14,0.18,1.8),"#9e9277")
	for i in range(10):
		block(Vector3(-6.3+i*1.4,1.13,-6.92),Vector3(1.23,1.34,0.06),"#899381" if i%2 else "#74836f")
		block(Vector3(-6.3+i*1.4,1.52,-6.86),Vector3(0.5,0.07,0.08),"#b7bead")
	for i in range(12): cylinder(Vector3(-6.2+i*1.1,2.2+i%3*0.1,-7.7),0.11,0.18,0.4+i%3*0.2,"#b4dcbb" if i%2 else "#b1c2d7")
	block(Vector3(-4.6,2.7,-8.55),Vector3(3,1.15,0.4),"#364a4a")
	block(Vector3(-4.6,2.72,-8.32),Vector3(2.7,0.8,0.04),"#7cbcaf",null,true)
	for side: int in [-1,1]: block(Vector3(side*4,5.87,-2),Vector3(3,0.08,0.2),"#d4e8c7",null,true)
	var light := OmniLight3D.new()
	light.position = Vector3(0,4,-5)
	light.light_color = Color("a5e6b6")
	light.light_energy = 3
	light.omni_range = 18
	root.add_child(light)
	actors.rick = humanoid("rick",Vector3(-1.7,0,-4.1))
	actors.morty = humanoid("morty",Vector3(0.2,0,-5))
	portal(Vector3(-5.8,2.5,-8.4),"#87eb54")
	actors.cage = group(Vector3(0,1.7,1))
	for i in range(4):
		block(Vector3(-1.1+i*0.73,0,0),Vector3(0.035,2.1,0.035),"#8cf77c",actors.cage,true)
		block(Vector3(0,-1.05+i*0.7,0),Vector3(2.2,0.035,0.035),"#8cf77c",actors.cage,true)
	actors.beam = beam(Vector3(-1,1.2,-4),Vector3(0,1.7,1),"#92ef77")

func cyber() -> void:
	block(Vector3(0,-0.2,0),Vector3(35,0.4,55),"#242b45")
	for x in range(-16,17,2): block(Vector3(x,0.015,-8),Vector3(0.022,0.025,48),"#74537d")
	for z in range(-30,16,2): block(Vector3(0,0.016,z),Vector3(34,0.025,0.022),"#74537d")
	for side: int in [-1,1]:
		for i in range(9):
			var x := side*(7+i%3*1.8)
			var h := 6+i%4*2
			var z := 4-i*6
			block(Vector3(x,h/2.0,z),Vector3(2,h,2),"#242a42")
			for j in range(5): block(Vector3(x,j*1.2+1,z+1.01),Vector3(0.7,0.4,0.03),"#66998e" if j%2 else "#d17caf",null,true)
	actors.neo = group(Vector3(-1.5,1,-5))
	var puppet: Node3D = actors.neo
	block(Vector3(0,1.1,0),Vector3(0.8,1.2,0.5),"#b86baf",puppet)
	block(Vector3(0,1.15,0.27),Vector3(0.42,0.6,0.05),"#ebbadc",puppet)
	block(Vector3(0,1.2,0.31),Vector3(0.23,0.22,0.02),"#79ffcc",puppet,true)
	block(Vector3(0,2.1,0),Vector3(0.58,0.66,0.44),"#e8ddcb",puppet)
	block(Vector3(0,2.45,-0.05),Vector3(0.63,0.16,0.5),"#232232",puppet)
	block(Vector3(-0.18,2.2,0.24),Vector3(0.28,0.18,0.07),"#f4c943",puppet)
	block(Vector3(0.18,2.2,0.24),Vector3(0.28,0.18,0.07),"#df64b3",puppet)
	block(Vector3(0.4,2.04,0.16),Vector3(0.45,0.13,0.15),"#e8ddcb",puppet)
	block(Vector3(0,1.87,0.24),Vector3(0.49,0.1,0.04),"#171526",puppet)
	for side: int in [-1,1]:
		block(Vector3(side*0.25,0.27,0),Vector3(0.21,0.6,0.23),"#dbc2e9",puppet)
		block(Vector3(side*0.3,-0.06,0.14),Vector3(0.4,0.16,0.45),"#eee1ef",puppet)
		block(Vector3(side*1.08,1.5,-0.18),Vector3(1.5,0.9,0.18),"#ebb7d7" if side<0 else "#b7b3e9",puppet).rotation.z = side*0.5
		beam(Vector3(side*0.6,2,0),Vector3(side*1.4,8,-1),"#64cbb5",puppet)
	actors.lock = group(Vector3(3.4,2,-8.8))
	for i in range(6): block(Vector3(0,0,0.1),Vector3(2.5,0.07,0.07),"#e094ce",actors.lock,true).rotation.z = i*PI/6

func animate(age: float,dt: float,accept_input: bool) -> void:
	if camera==null: return
	if accept_input:
		gaze.x += (int(Input.is_physical_key_pressed(KEY_RIGHT))-int(Input.is_physical_key_pressed(KEY_LEFT)))*dt*0.8
		gaze.y = clampf(gaze.y+(int(Input.is_physical_key_pressed(KEY_DOWN))-int(Input.is_physical_key_pressed(KEY_UP)))*dt*0.55,-0.65,0.65)
		var side := int(Input.is_physical_key_pressed(KEY_D))-int(Input.is_physical_key_pressed(KEY_A))
		var forward := int(Input.is_physical_key_pressed(KEY_W))-int(Input.is_physical_key_pressed(KEY_S))
		var direction := Vector2(sin(gaze.x)*forward+cos(gaze.x)*side,-cos(gaze.x)*forward+sin(gaze.x)*side).normalized()
		walk += direction*dt*(5 if Input.is_physical_key_pressed(KEY_SHIFT) else 3)
		var bounds: Rect2 = [Rect2(-5,-6,10,20),Rect2(-13,-34,26,46),Rect2(-14,-29,28,36),Rect2(-5,-4,10,8),Rect2(-7.5,-11,15,16),Rect2(-14,-32,28,44)][scene_index]
		walk = walk.clamp(bounds.position,bounds.end)
	var base_y := 2.1 if scene_index==2 else 1.72
	var base_z := 6.4 if scene_index==4 else (9.0 if scene_index==0 else 8.0)
	camera.position = Vector3(walk.x,base_y,base_z+walk.y)
	camera.rotation = Vector3(-gaze.y,-gaze.x,0)
	if actors.has("portal"): actors.portal.rotation.z = age*0.12
	if scene_index==0:
		actors.hero.position = Vector3(-2.4+sin(age*1.3)*1.5,3+cos(age*1.3)*0.6,-6)
		actors.hero.rotation.z = sin(age*1.3)*0.3
	elif scene_index==3: actors.hero.position.y = 0.4+maxf(0,sin(age*2))*0.6
	elif scene_index==4:
		var progress := clampf((age-6.5)/2.3,0,1)
		actors.cage.visible = age>6.5
		actors.beam.visible = age>6.5 and age<11.3
		actors.cage.position.z = -3+progress*6
		actors.cage.scale = Vector3.ONE*(0.3+progress*0.7)
		if age>11.3:
			actors.cage.rotation.z = 0.3+age-11.3
			actors.cage.position.x = 1+(age-11.3)*2
			actors.cage.position.y = maxf(0.3,1.7-(age-11.3))
		actors.rick.rotation.y = sin(age)*0.12
	elif scene_index==5:
		actors.neo.position.y = 1+sin(age*2)*0.12
		actors.lock.visible = age>1.8
		actors.lock.rotation.z = age*0.2
