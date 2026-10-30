extends RefCounted
## Rounded procedural actors and larger art-directed sets; original fan-made assets.
static func humanoid(kind: String,pos: Vector3,w) -> Node3D:
	var g: Node3D = w.group(pos)
	var skin := "#b9afa0" if kind=="war" else ("#a72d46" if kind=="spider" else "#dfc0a5")
	var shirt: String = {"war":"#b9afa0","spider":"#a72d46","rick":"#e5e8e3","morty":"#e2be4e"}[kind]
	var pants: String = {"war":"#4d3931","spider":"#253d68","rick":"#665e55","morty":"#476380"}[kind]
	ellipsoid(w,g,Vector3(0,0.94,0),Vector3(0.29,0.22,0.18),pants)
	ellipsoid(w,g,Vector3(0,1.38,0),Vector3(0.4 if kind=="war" else 0.31,0.44,0.19),shirt)
	w.cylinder(Vector3(0,1.78,0),0.095,0.12,0.19,skin,g,24)
	ellipsoid(w,g,Vector3(0,2.02,0),Vector3(0.19,0.32 if kind=="rick" else 0.25,0.19),skin)
	for side: int in [-1,1]:
		limb(w,g,Vector3(side*0.18,0.9,0),Vector3(side*0.19,0.52,0.01),0.115,pants)
		limb(w,g,Vector3(side*0.19,0.52,0.01),Vector3(side*0.2,0.16,0.03),0.095,pants)
		w.block(Vector3(side*0.2,0.1,0.11),Vector3(0.24,0.2,0.43),"#37343a",g)
		ellipsoid(w,g,Vector3(side*0.34,1.58,0),Vector3(0.17,0.18,0.19),shirt)
		limb(w,g,Vector3(side*0.37,1.56,0),Vector3(side*0.46,1.2,0.035),0.14 if kind=="war" else 0.115,shirt)
		limb(w,g,Vector3(side*0.46,1.2,0.035),Vector3(side*0.48,0.9,0.11),0.09,shirt if kind=="rick" else skin)
		ellipsoid(w,g,Vector3(side*0.48,0.85,0.12),Vector3(0.09,0.12,0.065),skin)
		for i in range(4): limb(w,g,Vector3(side*0.43+i*0.029,0.83,0.15),Vector3(side*0.43+i*0.029,0.73,0.155),0.016,skin)
		ellipsoid(w,g,Vector3(side*0.082,2.065,0.163),Vector3(0.076 if kind=="spider" else 0.055,0.045,0.025),"#f2eee5")
		if kind!="spider":
			ellipsoid(w,g,Vector3(side*0.082,2.064,0.186),Vector3(0.017,0.023,0.008),"#282e33")
			w.block(Vector3(side*0.081,2.116,0.176),Vector3(0.112,0.025,0.025),"#88b9c6" if kind=="rick" else "#5f493d",g)
	if kind!="spider": ellipsoid(w,g,Vector3(0,2.015,0.192),Vector3(0.035,0.075,0.065),skin)
	var mouth: MeshInstance3D = w.block(Vector3(0,1.935,0.175),Vector3(0.1,0.025,0.022),"#76544d",g)
	g.set_meta("mouth",mouth)
	if kind=="rick":
		for i in range(17):
			var a := i*TAU/17
			var spike: MeshInstance3D = w.cylinder(Vector3(cos(a)*0.23,2.15+sin(a)*0.22,-0.025),0,0.075,0.35,"#9cbfcb",g,6)
			spike.rotation.z = -a+PI/2
		w.block(Vector3(0,1.33,0.185),Vector3(0.18,0.68,0.035),"#80b5b0",g)
		for side: int in [-1,1]:
			w.block(Vector3(side*0.16,1.13,0.1),Vector3(0.22,0.94,0.33),"#e2e6df",g)
			w.block(Vector3(side*0.11,1.59,0.287),Vector3(0.13,0.32,0.025),"#f2f2e9",g).rotation.z = side*0.28
			w.block(Vector3(side*0.19,1.02,0.279),Vector3(0.12,0.12,0.018),"#bdc7c2",g)
		w.block(Vector3(0.64,1.05,0.16),Vector3(0.42,0.17,0.21),"#768e82",g)
		w.block(Vector3(0.9,1.05,0.27),Vector3(0.1,0.075,0.025),"#9cea6e",g,true)
	elif kind=="war":
		ellipsoid(w,g,Vector3(0,1.89,0.13),Vector3(0.185,0.16,0.1),"#534438")
		w.block(Vector3(0.07,2.03,0.185),Vector3(0.047,0.41,0.028),"#963e3d",g)
		w.block(Vector3(-0.12,1.44,0.19),Vector3(0.055,0.53,0.025),"#963e3d",g).rotation.z = 0.42
		ellipsoid(w,g,Vector3(-0.32,1.61,-0.015),Vector3(0.23,0.2,0.24),"#63513c")
		w.block(Vector3(0,0.97,0),Vector3(0.65,0.18,0.43),"#554334",g)
		for i in range(-2,3): w.block(Vector3(i*0.11,0.76,0.23),Vector3(0.1,0.34,0.055),"#695642",g)
		w.cylinder(Vector3(0.75,1.15,0.05),0.035,0.035,1.6,"#64503b",g,20)
		w.block(Vector3(0.96,1.78,0.05),Vector3(0.51,0.49,0.095),"#8caab0",g).rotation.z = 0.22
		for i in range(3): w.beam(Vector3(0.85+i*0.08,1.62,0.103),Vector3(0.93+i*0.08,1.92,0.103),"#82d5eb",g)
	elif kind=="spider":
		for i in range(6): w.beam(Vector3(-0.22,1.16+i*0.1,0.175),Vector3(0.22,1.16+i*0.1,0.175),"#442334",g)
		for i in range(-2,3): w.beam(Vector3(i*0.06,1.08,0.18),Vector3(i*0.09,1.7,0.14),"#442334",g)
	elif kind=="morty": ellipsoid(w,g,Vector3(0,2.19,-0.025),Vector3(0.214,0.13,0.2),"#624735")
	return g

static func ellipsoid(w,g: Node3D,pos: Vector3,size: Vector3,color: String) -> MeshInstance3D:
	var geo := SphereMesh.new()
	geo.radius = 1
	geo.height = 2
	geo.radial_segments = 24
	geo.rings = 16
	var node: MeshInstance3D = w.shape(geo,pos,color,g)
	node.scale = size
	return node

static func limb(w,g: Node3D,a: Vector3,b: Vector3,radius: float,color: String) -> void:
	var geo := CapsuleMesh.new()
	geo.radius = radius
	geo.height = maxf(radius*2,a.distance_to(b))
	geo.radial_segments = 16
	geo.rings = 8
	var node: MeshInstance3D = w.shape(geo,(a+b)/2,color,g)
	node.quaternion = Quaternion(Vector3.UP,(b-a).normalized())

static func enrich(index: int,w) -> void:
	var color: String = ["#59636d","#c5d2d3","#6b944e","#879bb6","#7f8a80","#35405c"][index]
	var size := Vector3(13,0.4,34) if index==0 else (Vector3(18,0.3,28) if index==4 else Vector3(100,0.4,140))
	var floor_mesh: MeshInstance3D = w.block(Vector3(0,-0.22,-15 if index!=4 else 0),size,color)
	if index in [0,1,4,5]:
		var surface := StandardMaterial3D.new()
		surface.albedo_color = Color(color)
		surface.roughness = 0.82
		var noise := FastNoiseLite.new()
		noise.frequency = 0.08
		var normal := NoiseTexture2D.new()
		normal.width = 128
		normal.height = 128
		normal.noise = noise
		normal.seamless = true
		normal.as_normal_map = true
		normal.bump_strength = 0.35
		surface.normal_enabled = true
		surface.normal_texture = normal
		surface.uv1_scale = Vector3(16,16,16)
		floor_mesh.material_override = surface
	if index==0:
		for side: int in [-1,1]:
			for i in range(12):
				var z := 14-i*11
				var x := side*(20+i%3*6)
				var h := 14+i%5*5
				w.block(Vector3(x,h/2.0-8,z),Vector3(10,h,9),"#415061")
				w.block(Vector3(x,h-7.6,z),Vector3(11,0.4,10),"#67747c")
				for j in range(8): w.block(Vector3(x-3+j%4*2,j%2*3+1,z+4.53),Vector3(0.8,1.3,0.05),"#b9c7c7",null,true)
	elif index==1:
		for i in range(35):
			var x := (1 if i%2 else -1)*(7+i%6*2)
			var rock: MeshInstance3D = w.ball(Vector3(x,0.2,10-i*2),0.7+i%3*0.3,"#8b9c9f")
			rock.scale = Vector3(1.6,0.6,1.1)
		for i in range(9): w.cylinder(Vector3((1 if i%2 else -1)*(22+i*2),10+i%3*4,-24-i*8),0,12,26+i%3*7,"#728b96",null,9)
	elif index==2:
		for i in range(20):
			var x := (1 if i%2 else -1)*(8+i%5*4)
			var z := -8-i*3
			w.block(Vector3(x,1.7,z),Vector3(0.8,3.4,0.8),"#655133")
			for j in range(3): w.block(Vector3(x,3.5+j*0.6,z),Vector3(3.6-j*0.8,0.9,3.6-j*0.8),"#63924a" if j%2 else "#42763d")
	elif index==3:
		for i in range(26): w.block(Vector3(sin(i*0.7)*7,2+i*0.08,-20-i*4),Vector3(3,0.6,3),"#967abf" if i%2 else "#63aebc")
	elif index==4:
		for side: int in [-1,1]:
			for i in range(5):
				w.block(Vector3(side*8.5,1.3,-6+i*3),Vector3(0.6,2.6,1.8),"#64776d")
				w.block(Vector3(side*8.15,1.6,-6+i*3),Vector3(0.03,0.06,0.6),"#b5c5b6")
			for j in range(3): w.beam(Vector3(side*7,5.6,-8),Vector3(side*7,5.6,12),"#728d88")
		for i in range(7): w.block(Vector3(0,5.75,-6+i*3),Vector3(16,0.16,0.22),"#4b6260")
		for i in range(6):
			w.ball(Vector3(-5+i*2,2.22,-7.3),0.18,"#86b6bc" if i%2 else "#a2c0a1")
			w.cylinder(Vector3(-5+i*2,2.46,-7.3),0.065,0.065,0.22,"#b7c8ba",null,16)
	else:
		for side: int in [-1,1]:
			for i in range(14):
				var x := side*(16+i%4*3)
				var z := 12-i*6
				var h := 9+i%5*4
				w.block(Vector3(x,h/2.0,z),Vector3(3,h,3),"#29344e")
				for j in range(5): w.block(Vector3(x,j*1.7+2,z+1.53),Vector3(1.5,0.6,0.03),"#95648e" if j%2 else "#6caaa0",null,true)
