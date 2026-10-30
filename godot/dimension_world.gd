extends Node3D
## Real 3D first-person sets. Procedural meshes, lights and volumetric characters.
var camera: Camera3D
var root: Node3D
var scene_index := -1
var actors: Dictionary = {}
var palette: Dictionary = {}
var gaze := Vector2.ZERO
var walk := Vector2.ZERO
var layout
var run_seed := 1

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

func build(index: int,seed_number: int=1) -> void:
	if root: root.free()
	palette.clear()
	actors.clear()
	run_seed = seed_number
	layout = preload("res://world_layout.gd").new()
	layout.generate(index,run_seed)
	scene_index = index
	gaze = Vector2.ZERO
	walk = layout.spawn
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
	actors = preload("res://procedural_dimension.gd").new().render(layout,self)

func make_puppet() -> Dictionary:
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
	actors.lock = group(Vector3(layout.portal_position.x,2,layout.portal_position.y+0.2))
	for i in range(6): block(Vector3(0,0,0.1),Vector3(2.5,0.07,0.07),"#e094ce",actors.lock,true).rotation.z = i*PI/6

	return actors

func animate(age: float,dt: float,accept_input: bool) -> void:
	if camera==null: return
	if accept_input:
		gaze.x += (int(Input.is_physical_key_pressed(KEY_RIGHT))-int(Input.is_physical_key_pressed(KEY_LEFT)))*dt*0.8
		gaze.y = clampf(gaze.y+(int(Input.is_physical_key_pressed(KEY_DOWN))-int(Input.is_physical_key_pressed(KEY_UP)))*dt*0.55,-0.65,0.65)
		var side := int(Input.is_physical_key_pressed(KEY_D))-int(Input.is_physical_key_pressed(KEY_A))
		var forward := int(Input.is_physical_key_pressed(KEY_W))-int(Input.is_physical_key_pressed(KEY_S))
		var direction := Vector2(sin(gaze.x)*forward+cos(gaze.x)*side,-cos(gaze.x)*forward+sin(gaze.x)*side).normalized()
		walk = layout.move_position(walk,direction*dt*(5 if Input.is_physical_key_pressed(KEY_SHIFT) else 3))
	camera.position = Vector3(walk.x,layout.ground_at(walk)+1.72,walk.y)
	camera.rotation = Vector3(-gaze.y,-gaze.x,0)
	for key: String in ["hero","rick","morty"]:
		if actors.has(key) and scene_index!=0:
			var pos: Vector3 = actors[key].position
			var delta := walk-Vector2(pos.x,pos.z)
			if delta.length()<0.65 and delta.length()>0.001:
				var corrected := Vector2(pos.x,pos.z)+delta.normalized()*0.65
				if not layout.blocked(corrected):
					walk = corrected
					camera.position = Vector3(walk.x,layout.ground_at(walk)+1.72,walk.y)
	if actors.has("portal"): actors.portal.rotation.z = age*0.12
	if scene_index==0:
		actors.hero.position = Vector3(-2.4+sin(age*1.3)*1.5,3+cos(age*1.3)*0.6,-6)
		actors.hero.rotation.z = sin(age*1.3)*0.3
	elif scene_index==3: actors.hero.position.y = layout.ground_at(Vector2(-1.4,-3))+maxf(0,sin(age*2))*0.3
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
