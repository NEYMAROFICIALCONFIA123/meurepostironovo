extends Node2D
## First-person 3D dimensions rendered in a SubViewport. Only captions are 2D.
var host
var stage := 0
var age := 0.0
var font: Font = ThemeDB.fallback_font
var viewport_3d: SubViewport
var dimension_world
const TITLES := ["HOMEM-ARANHA", "GOD OF WAR", "MINECRAFT", "ROBLOX", "RICK E MORTY", "SPAMTON NEO"]
const TAGS := ["NOVA YORK", "MIDGARD", "MUNDO DE BLOCOS", "OBBY IMPOSSÍVEL", "GARAGEM DO RICK", "DESTINO BLOQUEADO"]
const LINES := ["Você atravessou a teia do multiverso.", "Até os deuses ficaram confusos com essa visita.", "Você quase virou um bloco de determinação.", "Checkpoint? Não. Outro teletransporte.", "Rick: uma alma fora do roteiro? Vou capturar você!", "VOCÊ NÃO VAI A LUGAR NENHUM, [[BIG SHOT]]!"]
const DURATIONS := [8.0,8.0,8.0,8.0,10.0,7.0]
const COLORS := ["ed7185","8fdaec","b4e58b","f4cd70","b3ee75","ec9bd4"]

func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	viewport_3d = SubViewport.new()
	viewport_3d.size = Vector2i(960,600)
	viewport_3d.own_world_3d = true
	viewport_3d.msaa_3d = Viewport.MSAA_2X
	viewport_3d.render_target_update_mode = SubViewport.UPDATE_DISABLED
	add_child(viewport_3d)
	dimension_world = preload("res://dimension_world.gd").new()
	viewport_3d.add_child(dimension_world)

func begin() -> void:
	stage = 0
	age = 0
	host.mode = "multiverse"
	dimension_world.build(stage)
	viewport_3d.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	queue_redraw()

func advance() -> void:
	if host.mode!="multiverse" or age<0.65: return
	stage += 1
	age = 0
	if stage>=6:
		viewport_3d.render_target_update_mode = SubViewport.UPDATE_DISABLED
		host.start_crossover()
		host.cyber_next_wave()
	else:
		dimension_world.build(stage)
	queue_redraw()

func _process(dt: float) -> void:
	var active: bool = host.mode=="multiverse"
	var paused: bool = host.mode=="paused" and host.before_pause=="multiverse"
	if active:
		age += minf(dt,0.05)
		if age>=DURATIONS[stage]: advance()
	if (active or paused) and stage<6:
		dimension_world.animate(age,minf(dt,0.05) if active else 0.0,active)
		viewport_3d.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	else:
		viewport_3d.render_target_update_mode = SubViewport.UPDATE_DISABLED
	queue_redraw()

func _input(event: InputEvent) -> void:
	if host.mode!="multiverse": return
	if event is InputEventMouseButton and event.pressed and event.button_index==MOUSE_BUTTON_RIGHT:
		advance()
	if event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		dimension_world.gaze.x += event.relative.x*0.003
		dimension_world.gaze.y = clampf(dimension_world.gaze.y+event.relative.y*0.003,-0.65,0.65)

func r(x: float,y: float,w: float,h: float,c: Color) -> void:
	draw_rect(Rect2(x,y,w,h),c)

func txt(s: String,x: float,y: float,size: int,c: Color,center: bool=false) -> void:
	var offset := font.get_string_size(s,HORIZONTAL_ALIGNMENT_LEFT,-1,size).x/2 if center else 0.0
	draw_string(font,Vector2(x-offset,y),s,HORIZONTAL_ALIGNMENT_LEFT,-1,size,c)

func _draw() -> void:
	if host.mode!="multiverse" and not (host.mode=="paused" and host.before_pause=="multiverse"): return
	if stage>=6 or viewport_3d==null: return
	var c := Color(COLORS[stage])
	draw_texture_rect(viewport_3d.get_texture(),Rect2(0,0,960,600),false)
	r(0,0,960,80,Color("080c19ba"))
	txt(TAGS[stage]+" · 3D / PRIMEIRA PESSOA",30,28,12,c)
	txt(TITLES[stage],30,61,27,Color("f0e7f2"))
	txt("SALTO %d / 6" % (stage+1),815,46,14,c)
	r(478,298,4,4,Color("ffffffaa"))
	if stage==4 and age>3.7:
		r(319,115,322,37,Color("172318bb"))
		txt("CAPTURA FALHOU · RICK ERROU!",480,139,16,Color("b3ee75"),true)
	if stage==5 and age>1.8:
		r(285,114,390,37,Color("34203ccc"))
		txt("TELETRANSPORTE: BLOQUEADO",480,138,17,Color("f2b3da"),true)
	r(0,496,960,104,Color("080c19d9"))
	txt("Rick errou. Você já estava em outro universo." if stage==4 and age>3.7 else LINES[stage],480,524,16,Color("d7ddea"),true)
	for i in range(6):
		r(330+i*52,546,43,3,c if i<stage else Color("30364b"))
		if i==stage: r(330+i*52,546,43*age/DURATIONS[stage],3,c)
	txt("WASD: EXPLORAR · ARRASTE / SETAS: OLHAR · ENTER: SALTAR · ESC: PAUSAR",480,577,12,Color("a7b5c9"),true)
	if age<0.18: r(0,0,960,600,Color(c.r,c.g,c.b,(0.18-age)*3))
	if host.mode=="paused":
		r(0,0,960,600,Color("060910dd"))
		txt("PAUSADO · ESC PARA CONTINUAR",480,300,26,Color("efbb77"),true)
