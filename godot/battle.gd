extends Node2D
## LAST BREATH: projected 2.5D geometry with pixel-art sprites and 2D collision.
const ARENA := Rect2(280, 326, 400, 162)
const WHITE := Color("e6e6e9")
const GOLD := Color("efbb77")
const CYAN := Color("69e7f0")
const RED := Color("ff536b")
var font: Font = ThemeDB.fallback_font
var mode := "title"
var before_pause := "attack"
var elapsed := 0.0
var clock := 0.0
var wave := 0
var hits := 0
var hp := 92
var pies := 3
var selected := 0
var soul := Vector2(480, 410)
var velocity := 0.0
var gravity := false
var immunity := 0.0
var spawn_count := 0
var hazards: Array[Dictionary] = []
var sparks: Array[Dictionary] = []
var message := "é um belo dia lá fora."
var message_time := 0.0
var cursor := 0.0
var practice := false
var muted := false
var music_player: AudioStreamPlayer
var music_bus := 0

func _ready() -> void:
	RenderingServer.set_default_clear_color(Color("05070d"))
	music_player = AudioStreamPlayer.new()
	var track := load("res://assets/determination.wav") as AudioStreamWAV
	if track:
		track.loop_mode = AudioStreamWAV.LOOP_FORWARD
		track.loop_end = int(track.get_length() * track.mix_rate)
		music_player.stream = track
		music_player.volume_db = -12
		add_child(music_player)
	queue_redraw()

func r(x: float, y: float, w: float, h: float, color: Color) -> void:
	draw_rect(Rect2(roundf(x), roundf(y), roundf(w), roundf(h)), color)

func label(s: String, x: float, y: float, size: int = 16, color: Color = WHITE, centered: bool = false) -> void:
	var offset := font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x * 0.5 if centered else 0.0
	draw_string(font, Vector2(x - offset, y), s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)

func heart(pos: Vector2, color: Color, scale_factor: float = 2.0) -> void:
	var rows := ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"]
	for j in range(rows.size()):
		for i in range(7):
			if rows[j][i] == "1":
				r(pos.x + (i - 3.5) * scale_factor, pos.y + (j - 3) * scale_factor, scale_factor, scale_factor, color)

func skull(pos: Vector2, s: float = 2.6, glowing: bool = false) -> void:
	var pieces := [Rect2(-12,-17,24,3), Rect2(-16,-14,32,6), Rect2(-18,-8,36,15), Rect2(-15,7,30,7), Rect2(-11,14,22,3)]
	for piece in pieces:
		draw_rect(Rect2(pos + piece.position * s, piece.size * s), WHITE)
	for piece in [Rect2(-14,-5,11,8), Rect2(4,-5,10,8), Rect2(-2,4,3,4), Rect2(-12,8,25,2)]:
		draw_rect(Rect2(pos + piece.position * s, piece.size * s), Color("151522"))
	if glowing:
		draw_rect(Rect2(pos + Vector2(7,-4)*s, Vector2(5,5)*s), CYAN)
	for i in range(-8, 10, 5):
		draw_rect(Rect2(pos + Vector2(i,9)*s, Vector2(1,4)*s), Color("343845"))

func sans() -> void:
	var y := 180 + sin(clock * 2) * 2
	r(443,y+69,29,43,Color("171b2a"))
	r(488,y+69,29,43,Color("171b2a"))
	r(432,y+107,45,15,Color("b8bdcf"))
	r(483,y+107,45,15,Color("b8bdcf"))
	r(430,y+120,49,6,Color("f0dbe7"))
	r(483,y+120,49,6,Color("f0dbe7"))
	r(430,y+22,100,63,Color("376aa6"))
	r(423,y+32,19,44,Color("528bc3"))
	r(520,y+32,19,44,Color("528bc3"))
	r(437,y+18,86,16,Color("a9c7e0"))
	r(454,y+26,52,60,Color("e0e4e9"))
	r(443,y+37,19,44,Color("407cb8"))
	r(501,y+37,19,44,Color("407cb8"))
	r(475,y+37,5,44,Color("9da9b8"))
	r(428,y+70,24,13,WHITE)
	r(511,y+70,24,13,WHITE)
	r(440,y+81,81,13,Color("202535"))
	r(425,y+36,6,32,Color("79b4d9"))
	r(526,y+36,6,32,Color("244269"))
	r(443,y+44,15,5,Color("254d7a"))
	r(503,y+44,15,5,Color("254d7a"))
	r(449,y+89,5,21,Color("394359"))
	r(490,y+89,5,21,Color("394359"))
	skull(Vector2(480, y-18), 2.6, gravity or wave >= 4)

# Perspective-projected world coordinates; sprites and collision remain on a 2D plane.
func project_25(p: Vector3) -> Vector2:
	var pointer := get_global_mouse_position() / Vector2(960,600) - Vector2(0.5,0.5)
	return Vector2(480+(p.x-pointer.x*7)*470/p.z,111+(119-p.y+pointer.y*3)*470/p.z).round()

func face_25(points: Array, color: Color) -> void:
	var screen := PackedVector2Array()
	for p: Vector3 in points:
		screen.append(project_25(p))
	draw_colored_polygon(screen,color)

func block_25(x: float, y: float, z: float, w: float, h: float, d: float, front: Color, side: Color, top: Color) -> void:
	face_25([Vector3(x,y,z),Vector3(x+w,y,z),Vector3(x+w,y+h,z),Vector3(x,y+h,z)],front)
	face_25([Vector3(x+w,y,z),Vector3(x+w,y,z+d),Vector3(x+w,y+h,z+d),Vector3(x+w,y+h,z)],side)
	face_25([Vector3(x,y,z+d),Vector3(x,y,z),Vector3(x,y+h,z),Vector3(x,y+h,z+d)],side)
	face_25([Vector3(x,y+h,z),Vector3(x+w,y+h,z),Vector3(x+w,y+h,z+d),Vector3(x,y+h,z+d)],top)

func corridor() -> void:
	r(0,0,960,600,Color("060914"))
	r(0,0,960,324,Color("15182b"))
	var arch_colors := ["39334d","191b32","51445f","202039","6c5266","27253e","a57979"]
	for i in range(7):
		var inset := i*11
		r(320+inset,-60+inset,320-inset*2,248-inset,Color(arch_colors[i]))
	r(399,17,162,156,Color("302b47"))
	r(409,25,142,141,Color("b3777e"))
	r(418,32,124,128,Color("e4aa89"))
	var glass := ["dca187","b37b87","775b83","dfb58e","8c7199"]
	for row in range(7):
		for col in range(7):
			r(427+col*15,40+row*16,13,14,Color(glass[(col+row*2)%5]))
	r(477,25,6,140,Color("41364c"))
	r(409,93,142,5,Color("41364c"))
	for z in range(1800,149,-90):
		for x in range(-720,720,90):
			var tile_color := Color("282839") if (int(x/90.0)+int(z/90.0))%2==0 else Color("1b2031")
			face_25([Vector3(x,0,z),Vector3(x+88,0,z),Vector3(x+88,0,z+88),Vector3(x,0,z+88)],tile_color)
	for z in range(1000,239,-25):
		var point := project_25(Vector3(0,0.5,z))
		var w := 70.0*470/z
		r(point.x-w/2+sin(z*0.17)*5,point.y,w,2,Color("e9ba8b18"))
	draw_colored_polygon(PackedVector2Array([Vector2(418,65),Vector2(443,70),Vector2(320,324),Vector2(150,324)]),Color("b9876b13"))
	draw_colored_polygon(PackedVector2Array([Vector2(491,46),Vector2(522,50),Vector2(788,324),Vector2(547,324)]),Color("b9baf11a"))
	for z: int in [1100,820,580,390,255]:
		for side: int in [-1,1]:
			var x := side*255-21
			block_25(x-15,0,z-10,72,8,55,Color("534155"),Color("252239"),Color("827087"))
			block_25(x-9,8,z-6,60,10,47,Color("44374e"),Color("211e32"),Color("6f5970"))
			block_25(x,18,z,42,205,36,Color("49415b"),Color("23263d"),Color("736780"))
			block_25(x+5,20,z-0.4,5,197,1,Color("8e7284"),Color("55445f"),Color("ae8a91"))
			block_25(x+30,20,z-0.5,5,197,1,Color("2d2b44"),Color("22253d"),Color("64506c"))
			block_25(x-7,219,z-5,56,9,46,Color("65516b"),Color("30273f"),Color("9b7e87"))
			block_25(x-14,228,z-9,70,10,53,Color("70586f"),Color("30273e"),Color("ad8590"))
			var point := project_25(Vector3(x+20,117,z-4))
			var s := 470.0/z
			r(point.x-3*s,point.y,6*s,14*s,Color("6e5064"))
			r(point.x-2*s,point.y-6*s,4*s,9*s,Color("f5c79a"))
	# Elliptical contact shadow pins the sprite to the projected floor.
	var shadow := PackedVector2Array()
	for i in range(32):
		shadow.append(Vector2(480+cos(i*TAU/32)*76,318+sin(i*TAU/32)*12))
	draw_colored_polygon(shadow,Color("03071699"))
	sans()
	for i in range(56):
		var x := fposmod(i*131.71+sin(clock*0.23+i)*12,960)
		var y := fposmod(i*59.3-clock*(3+i%5),320)
		r(x,y,2 if i%7==0 else 1,2 if i%7==0 else 1,Color("f8d2aa70") if i%3==0 else Color("9aaada44"))
	# Opaque lower UI plane hides foreground projection beyond the stage.
	r(0,324,960,276,Color("060914"))

func arena_25() -> void:
	draw_colored_polygon(PackedVector2Array([Vector2(277,323),Vector2(683,323),Vector2(699,308),Vector2(261,308)]),Color("43445e"))
	draw_colored_polygon(PackedVector2Array([Vector2(261,308),Vector2(277,323),Vector2(277,491),Vector2(261,475)]),Color("191f34"))
	draw_colored_polygon(PackedVector2Array([Vector2(683,323),Vector2(699,308),Vector2(699,475),Vector2(683,491)]),Color("10182c"))
	draw_colored_polygon(PackedVector2Array([Vector2(277,491),Vector2(683,491),Vector2(699,505),Vector2(261,505)]),Color("141d30"))
	r(263,309,434,2,Color("9b849d"))
	for p: Vector2 in [Vector2(265,313),Vector2(688,313),Vector2(265,481),Vector2(688,481)]:
		r(p.x,p.y,7,7,Color("a597ab"))
		r(p.x+2,p.y+2,3,3,Color("292e44"))

func bone(x: float, y: float, h: float, color: Color = WHITE) -> void:
	if h <= 0:
		return
	r(x-3,y,6,h,color)
	r(x-6,y-3,5,7,color)
	r(x+1,y-3,5,7,color)
	r(x-6,y+h-4,5,7,color)
	r(x+1,y+h-4,5,7,color)

func say(s: String) -> void:
	message = s
	message_time = 2.5

func start() -> void:
	mode = "attack"
	wave = 0
	hits = 0
	hp = 92
	pies = 3
	elapsed = 0
	spawn_count = 0
	immunity = 1
	gravity = false
	velocity = 0
	soul = Vector2(480,410)
	hazards.clear()
	say("tu vai ter um mau momento.")
	if music_player.stream and not music_player.playing:
		music_player.play()

func next_wave() -> void:
	wave += 1
	elapsed = 0
	spawn_count = 0
	hazards.clear()
	gravity = wave % 3 == 1
	velocity = 0
	soul = Vector2(480,478 if gravity else 410)
	immunity = 1
	mode = "attack"
	say("gravidade. engraçado, né?" if gravity else "continua tentando.")

func confirm() -> void:
	match mode:
		"title", "dead", "win": start()
		"paused": toggle_pause()
		"aim":
			if absf(cursor-0.5)<0.35:
				hits += 1
			burst(Vector2(480,200),GOLD,25)
			if hits >= 8:
				mode = "win"
				hazards.clear()
			else:
				next_wave()
				say("... heh. quase." if absf(cursor-0.5)<0.18 else "errou o tempo. tente o centro.")
		"menu":
			if selected == 0:
				mode = "aim"
				elapsed = 0
			elif selected == 2:
				if pies > 0:
					pies -= 1
					hp = mini(92,hp+38)
					next_wave()
					say("torta de canela. +38 HP")
				else:
					next_wave()
					say("sem itens. mantenha-se firme.")
			else:
				next_wave()
				say("ossos azuis: fique parado." if selected == 1 else "você escolheu continuar.")

func toggle_pause() -> void:
	if mode == "paused":
		mode = before_pause
	elif mode in ["attack","menu","aim"]:
		before_pause = mode
		mode = "paused"
	music_player.stream_paused = mode == "paused"

func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	match event.keycode:
		KEY_ENTER, KEY_Z: confirm()
		KEY_ESCAPE: toggle_pause()
		KEY_X:
			if mode == "aim": mode = "menu"
		KEY_M:
			muted = not muted
			music_player.volume_db = -80 if muted else -12
		KEY_T:
			practice = not practice
		KEY_F:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN)
		KEY_RIGHT, KEY_D:
			if mode == "menu": selected = (selected+1)%4
		KEY_LEFT, KEY_A:
			if mode == "menu": selected = (selected+3)%4

func burst(pos: Vector2, color: Color, count: int) -> void:
	for i in range(count):
		sparks.append({"p":pos,"v":Vector2(randf_range(-120,120),randf_range(-120,120)),"life":randf_range(0.4,1),"c":color})

func hurt() -> void:
	if immunity > 0 or practice:
		return
	hp = maxi(0,hp-5)
	immunity = 0.55
	burst(soul,RED,12)
	if hp == 0:
		mode = "dead"
		hazards.clear()
		burst(soul,RED,45)

func spawn_hazard() -> void:
	match wave%4:
		0:
			hazards.append({"kind":"gate","x":700.0,"y":326.0,"gap":364+(sin(spawn_count*0.8)+1)*38,"blue":spawn_count%4==2})
		1:
			var h := 62 if spawn_count%3==0 else 30
			hazards.append({"kind":"bone","x":700.0,"y":488.0-h,"h":h})
		2:
			hazards.append({"kind":"laser","x":310.0+spawn_count*97%340,"y":356.0+spawn_count*43%100,"timer":0.0,"horizontal":spawn_count%3==0})
		3:
			hazards.append({"kind":"fall","x":298.0+spawn_count*83%360,"y":270.0,"h":36})
			if spawn_count%3==0:
				hazards.append({"kind":"laser","x":soul.x,"y":soul.y,"timer":0.0,"horizontal":false})
	spawn_count += 1

func _process(delta: float) -> void:
	var dt := minf(delta,0.033)
	if mode == "paused":
		queue_redraw()
		return
	clock += dt
	message_time -= dt
	for p in sparks:
		p.p += p.v * dt
		p.life -= dt
	sparks = sparks.filter(func(p: Dictionary) -> bool: return p.life > 0)
	if mode == "aim":
		elapsed += dt
		cursor = (sin(elapsed*3.5-PI/2)+1)/2
	if mode != "attack":
		queue_redraw()
		return
	elapsed += dt
	immunity = maxf(0,immunity-dt)
	var dx := float(int(Input.is_physical_key_pressed(KEY_RIGHT) or Input.is_physical_key_pressed(KEY_D))-int(Input.is_physical_key_pressed(KEY_LEFT) or Input.is_physical_key_pressed(KEY_A)))
	var dy := float(int(Input.is_physical_key_pressed(KEY_DOWN) or Input.is_physical_key_pressed(KEY_S))-int(Input.is_physical_key_pressed(KEY_UP) or Input.is_physical_key_pressed(KEY_W)))
	var speed := 110.0 if Input.is_physical_key_pressed(KEY_SHIFT) else 205.0
	var moving := dx != 0 or dy != 0 or absf(velocity)>12
	if gravity:
		if (Input.is_physical_key_pressed(KEY_UP) or Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_SPACE)) and soul.y >= 478:
			velocity = -345
		velocity += 940*dt
		soul += Vector2(dx*speed,velocity)*dt
		if soul.y > 479:
			soul.y = 479
			velocity = 0
	else:
		soul += Vector2(dx,dy).normalized()*speed*dt
	soul = soul.clamp(ARENA.position+Vector2(9,9),ARENA.end-Vector2(9,9))
	var interval := 1.15 if wave%4==2 else 0.78
	if elapsed > 1 and elapsed > (spawn_count+1)*interval:
		spawn_hazard()
	# Iterate a copy: a lethal collision clears the live list.
	for h in hazards.duplicate():
		match h.kind:
			"gate":
				h.x -= (125+wave*9)*dt
				if absf(soul.x-h.x)<11 and absf(soul.y-h.gap)>30 and (not h.blue or moving): hurt()
			"bone":
				h.x -= (160+wave*8)*dt
				if absf(soul.x-h.x)<11 and soul.y>h.y-7: hurt()
			"fall":
				h.y += (120+wave*10)*dt
				if absf(soul.x-h.x)<11 and soul.y>h.y-8 and soul.y<h.y+h.h+8: hurt()
			"laser":
				h.timer += dt
				var dist: float = absf(soul.y-h.y) if h.horizontal else absf(soul.x-h.x)
				if h.timer>1 and h.timer<1.48 and dist<17: hurt()
	hazards = hazards.filter(func(h: Dictionary) -> bool: return h.timer<1.7 if h.kind=="laser" else h.x>245 and h.y<558)
	if mode == "attack" and elapsed>11:
		mode = "menu"
		selected = 0
		hazards.clear()
		say("os ossos se aquietam. sua vez.")
	queue_redraw()

func draw_hazards() -> void:
	for h in hazards:
		match h.kind:
			"gate":
				var color: Color = CYAN if h.blue else WHITE
				bone(h.x,329,h.gap-35-329,color)
				bone(h.x,h.gap+35,485-h.gap-35,color)
			"bone", "fall":
				var y := maxf(329,h.y)
				bone(h.x,y,minf(h.h-(y-h.y),485-y))
			"laser":
				if h.timer<1:
					if h.horizontal: r(283,h.y,394,2,RED)
					else: r(h.x,329,2,156,RED)
				elif h.timer<1.48:
					if h.horizontal:
						r(283,h.y-11,394,22,CYAN)
						r(283,h.y-5,394,10,WHITE)
					else:
						r(h.x-11,329,22,156,CYAN)
						r(h.x-5,329,10,156,WHITE)
				if h.timer<1.48: skull(Vector2(254,h.y) if h.horizontal else Vector2(h.x,299),0.8,true)

func _draw() -> void:
	corridor()
	if mode == "title":
		r(170,335,620,230,Color("090c14ee"))
		label("LAST BREATH",480,387,48,GOLD,true)
		label("UM ENCONTRO COM SANS · 2.5D",480,417,13,WHITE,true)
		label("[ ENTER ]  ENCARAR O SANS",480,469,21,WHITE,true)
		label("WASD / SETAS: MOVER   Z: CONFIRMAR   ESC: PAUSAR",480,514,12,Color("858d9e"),true)
		label("T: TREINO   M: MÚSICA   F: TELA CHEIA",480,538,12,CYAN,true)
		return
	if message_time>0:
		r(568,155,314,52,Color("e6e5e0"))
		r(558,176,12,10,Color("e6e5e0"))
		label(message,582,185,14,Color("26232d"))
	label("TURNO %02d" % (wave+1),75,347,11,Color("6d7688"))
	label("ALMA AZUL" if gravity else "ALMA VERMELHA",742,347,11,CYAN if gravity else RED)
	label("%d / 8" % hits,795,369,12,Color("6d7688"))
	arena_25()
	r(277,323,406,168,Color("b9c3d6"))
	r(280,326,400,162,Color("030509"))
	if mode == "attack" or (mode == "paused" and before_pause == "attack"):
		draw_hazards()
		if immunity<=0 or int(clock*16)%2==0: heart(soul,Color("4c9cff") if gravity else RED,2.2)
		r(280,500,400,2,Color("242735"))
		r(280,500,400*minf(1,elapsed/11),2,CYAN if gravity else GOLD)
	elif mode == "menu":
		label("* você ainda está aqui.",304,365,20)
		label("* o que você vai fazer?",304,398,20)
		var tips := ["Ataque no centro. Sans vai desviar.","Ossos azuis: não se mova.","TORTA DE CANELA ×%d / +38 HP" % pies,"Às vezes, sobreviver é uma escolha."]
		label(tips[selected],304,455,13,Color("8c96a9"))
	elif mode == "aim":
		label("ACERTE O CENTRO",480,359,14,WHITE,true)
		for i in range(31):
			r(310+i*11,391,8,50,GOLD if i>12 and i<18 else Color("9c5f6b"))
		r(310+cursor*340,381,4,70,WHITE)
		label("Z / ENTER",480,474,12,WHITE,true)
	elif mode in ["dead","win"]:
		label("GAME OVER" if mode=="dead" else "DETERMINAÇÃO.",480,388,32,RED if mode=="dead" else GOLD,true)
		label("não desista. você pode tentar de novo." if mode=="dead" else "sans sorri. por hoje, é o suficiente.",480,425,14,WHITE,true)
		label("ENTER PARA RECOMEÇAR",480,466,13,WHITE,true)
	label("FRISK",157,538,19)
	label("LV 19",249,538,19)
	label("HP",379,538,14)
	r(412,523,126,17,Color("5b2333"))
	r(412,523,126*float(hp)/92,17,Color("f0cc59"))
	label("%02d / 92" % hp,552,538,19)
	label("TREINO" if practice else "KR",732,538,13,CYAN)
	var options := ["LUTAR","AGIR","ITEM","POUPAR"]
	for i in range(4):
		var x := 157+i*165
		var active := mode=="menu" and selected==i
		r(x,557,151,35,GOLD if active else Color("a37347"))
		r(x+2,559,147,31,Color("32251d") if active else Color("090b10"))
		if active: heart(Vector2(x+17,575),RED,1.4)
		label(options[i],x+83,582,20,GOLD,true)
	for p in sparks: r(p.p.x,p.p.y,3,3,p.c)
	if mode=="paused":
		r(0,0,960,600,Color("060910ee"))
		label("PAUSADO",480,267,40,GOLD,true)
		label("respire. você ainda está aqui.",480,314,18,WHITE,true)
		label("ENTER / ESC PARA CONTINUAR",480,364,17,WHITE,true)
