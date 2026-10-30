extends RefCounted
## Seeded finite layouts with complete terrain and a guaranteed clear main route.
var origin := Vector2.ZERO
var chunk := Vector2i.ZERO
var streamed := false
var stage := 0
var seed_value := 1
var half_x := 48
var half_z := 48
var cell := 2
var nx := 48
var nz := 48
var heights: Array = []
var props: Array[Dictionary] = []
var colliders: Array[Rect2] = []
var bounds := Rect2(-46,-46,92,92)
var spawn := Vector2(0,8)
var portal_position := Vector2(0,-20)
var rng := RandomNumberGenerator.new()

func generate(index: int,run_seed: int,chunk_pos: Vector2i=Vector2i.ZERO,is_streamed: bool=false) -> void:
	chunk = chunk_pos
	streamed = is_streamed
	stage = index
	seed_value = (run_seed ^ ((index+1)*7919)) & 0x7fffffff
	rng.seed = (seed_value ^ (chunk.x*374761393) ^ (chunk.y*668265263)) & 0x7fffffff
	half_x = 12 if index==4 else 48
	half_z = 18 if index==4 else 48
	origin = Vector2(chunk.x*half_x*2,chunk.y*half_z*2)
	nx = half_x
	nz = half_z
	bounds = Rect2(origin-Vector2(half_x,half_z),Vector2(half_x*2,half_z*2))
	if not streamed: bounds = bounds.grow(-2)
	portal_position = Vector2(0,-12 if index==4 else -20)
	heights.clear()
	props.clear()
	colliders.clear()
	for j in range(nz+1):
		var row: Array[float] = []
		for i in range(nx+1): row.append(natural_height(origin.x-half_x+i*2,origin.y-half_z+j*2))
		heights.append(row)
	var spacing := 4 if index==4 else 8
	for z in range(-half_z+int(spacing/2.0),half_z,spacing):
		for x in range(-half_x+int(spacing/2.0),half_x,spacing):
			var p := origin+Vector2(x+rng.randf_range(-0.15,0.15)*spacing,z+rng.randf_range(-0.15,0.15)*spacing)
			if index==4:
				if not reserved(p,1.2): add("machine" if rng.randf()>0.45 else "storage",p,Vector2(1.6,1.6))
				continue
			if reserved(p,2.8 if index==0 else (1.5 if index==5 else (1.2 if index==3 else 0.6))): continue
			var kind: String = ["building","pine" if rng.randf()>0.35 else "boulder","oak" if rng.randf()>0.18 else "boulder","pavilion" if rng.randf()>0.5 else "pillar","storage","tower" if rng.randf()>0.35 else "conduit"][index]
			var size := 4.2+rng.randf()*1.4 if index==0 else (2.5 if index==5 else (2.0 if index==3 else (4.1 if kind=="pine" else (3.2 if kind=="oak" else (3.8 if kind=="boulder" else 1.0)))))
			if reserved(p,size/2+0.1): continue
			var model := add(kind,p,Vector2.ONE*size)
			model.h = 9+rng.randf()*23 if index==0 else (7+rng.randf()*13 if index==5 else 3+rng.randf()*4)
			for k in range(3):
				var q := p+Vector2(rng.randf_range(-2.5,2.5),rng.randf_range(-2.5,2.5))
				if not reserved(q,0.3): add("bollard" if index==0 else ("stud" if index==3 else ("terminal" if index==5 else "groundcover")),q,Vector2.ONE*0.25,false)
	if index!=4:
		var z := -half_z+5.0
		while z<half_z-3:
			for side: int in [-1,1]:
				if absf(z)>4: add(["streetlamp","rune","flower","railpost","storage","neonpost"][index],origin+Vector2(side*(4.6+rng.randf()*0.5),z),Vector2.ONE*0.35,index!=2)
			z += 6+rng.randf()*2
	elif not streamed:
		var x := -9.0
		while x<10:
			add("cabinet",Vector2(x,-16),Vector2(2.3,1.3))
			add("bottle",Vector2(x,-15.5),Vector2.ONE*0.25,false)
			x += 2.6
		var z := -12.0
		while z<16:
			for side: int in [-1,1]: add("cabinet",Vector2(side*10.8,z),Vector2(1,2.6))
			z += 3.4

func noise_value(x: int,z: int) -> float:
	var n := (x*374761393+z*668265263+seed_value*7919)&0x7fffffff
	n = ((n^(n>>13))*1274126177)&0x7fffffff
	return float(n^(n>>16))/2147483647.0

func noise(x: float,z: float) -> float:
	var ix := floori(x)
	var iz := floori(z)
	var u := smoothstep(0,1,x-ix)
	var v := smoothstep(0,1,z-iz)
	return lerpf(lerpf(noise_value(ix,iz),noise_value(ix+1,iz),u),lerpf(noise_value(ix,iz+1),noise_value(ix+1,iz+1),u),v)

func natural_height(x: float,z: float) -> float:
	if stage not in [1,2]: return 0
	var taper := clampf((minf(absf(x),absf(z))-3)/7,0,1)
	return (noise(x*0.07,z*0.07)*(6 if stage==1 else 2.7)+noise(x*0.19,z*0.19)*0.55)*taper

func ground_at(world_position: Vector2) -> float:
	var p := world_position-origin
	var fx := (clampf(p.x,-half_x,half_x-0.00001)+half_x)/2
	var fz := (clampf(p.y,-half_z,half_z-0.00001)+half_z)/2
	var i := floori(fx)
	var j := floori(fz)
	var u := fx-i
	var v := fz-j
	var a: float = heights[j][i]
	var b: float = heights[j][i+1]
	var c: float = heights[j+1][i]
	var d: float = heights[j+1][i+1]
	if stage==2: return floorf((a+b+c+d)/4*2)/2
	return a+(b-a)*u+(c-a)*v if u+v<=1 else d+(c-d)*(1-u)+(b-d)*(1-v)

func reserved(p: Vector2,r: float=0) -> bool:
	return absf(p.x)<3.4+r or absf(p.y)<3.4+r or p.distance_to(spawn)<3+r or p.distance_to(Vector2(0,-20))<3+r

func add(kind: String,p: Vector2,size: Vector2,solid: bool=true) -> Dictionary:
	var model := {"kind":kind,"x":p.x,"z":p.y,"y":ground_at(p),"w":size.x,"d":size.y,"h":1+rng.randf()*2,"variant":rng.randi_range(0,6)}
	props.append(model)
	if solid: colliders.append(Rect2(p-size/2,size))
	return model

func blocked(p: Vector2,r: float=0.27) -> bool:
	if not streamed and not bounds.grow(-r).has_point(p): return true
	for rect in colliders:
		var closest := p.clamp(rect.position,rect.end)
		if closest.distance_squared_to(p)<r*r: return true
	return false

func move_position(p: Vector2,delta: Vector2) -> Vector2:
	var steps := maxi(1,ceili(delta.length()/0.15))
	for i in range(steps):
		if not blocked(p+Vector2(delta.x/steps,0)): p.x += delta.x/steps
		if not blocked(p+Vector2(0,delta.y/steps)): p.y += delta.y/steps
	return p
