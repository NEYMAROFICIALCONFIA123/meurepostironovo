extends Node2D
## Original animated pixel-art tributes; these are vignettes, not embedded games.
var host
var stage := 0
var age := 0.0
var font: Font = ThemeDB.fallback_font
const TITLES := ["HOMEM-ARANHA", "GOD OF WAR", "MINECRAFT", "ROBLOX", "RICK E MORTY", "SPAMTON NEO"]
const TAGS := ["NOVA YORK", "MIDGARD", "MUNDO DE BLOCOS", "OBBY IMPOSSÍVEL", "GARAGEM DO RICK", "DESTINO BLOQUEADO"]
const LINES := ["Você atravessou a teia do multiverso.", "Até os deuses ficaram confusos com essa visita.", "Você quase virou um bloco de determinação.", "Checkpoint? Não. Outro teletransporte.", "Rick: uma alma fora do roteiro? Vou capturar você!", "VOCÊ NÃO VAI A LUGAR NENHUM, [[BIG SHOT]]!"]
const DURATIONS := [4.4,4.4,4.4,4.4,6.2,5.2]
const COLORS := ["ed7185","8fdaec","b4e58b","f4cd70","b3ee75","ec9bd4"]

func begin() -> void:
	stage = 0
	age = 0
	host.mode = "multiverse"
	queue_redraw()

func advance() -> void:
	if host.mode!="multiverse" or age<0.65: return
	stage += 1
	age = 0
	if stage>=6:
		host.start_crossover()
		host.cyber_next_wave()
	queue_redraw()

func _process(dt: float) -> void:
	if host.mode=="multiverse":
		age += minf(dt,0.05)
		if age>=DURATIONS[stage]: advance()
	queue_redraw()

func _input(event: InputEvent) -> void:
	if host.mode=="multiverse" and event is InputEventMouseButton and event.pressed and event.button_index==MOUSE_BUTTON_LEFT:
		advance()

func r(x: float,y: float,w: float,h: float,c: Color) -> void:
	draw_rect(Rect2(roundf(x),roundf(y),roundf(w),roundf(h)),c)

func txt(s: String,x: float,y: float,size: int,c: Color,center: bool=false) -> void:
	var offset := font.get_string_size(s,HORIZONTAL_ALIGNMENT_LEFT,-1,size).x/2 if center else 0.0
	draw_string(font,Vector2(x-offset,y),s,HORIZONTAL_ALIGNMENT_LEFT,-1,size,c)

func poly(points: Array,c: Color) -> void:
	var vertices := PackedVector2Array()
	for p: Vector2 in points: vertices.append(p)
	draw_colored_polygon(vertices,c)

func heart(pos: Vector2,c: Color) -> void:
	var rows := ["0110110","1111111","1111111","0111110","0011100","0001000"]
	for j in range(6):
		for i in range(7):
			if rows[j][i]=="1": r(pos.x+(i-3.5)*3,pos.y+(j-3)*3,3,3,c)

func portal(pos: Vector2,radius: float,c: Color,locked: bool=false) -> void:
	for i in range(5): draw_arc(pos,radius+i*4,0,TAU,48,c if i%2 else Color("ecfff4"),2)
	if locked:
		r(pos.x-radius,-5+pos.y,radius*2,10,Color("d984c0"))
		txt("×",pos.x,pos.y+18,60,Color("ffe7fb"),true)

func hero(pos: Vector2,kind: int) -> void:
	draw_set_transform(pos,0,Vector2.ONE*3)
	if kind==0:
		r(-6,-20,12,13,Color("d34b68"))
		r(-5,-17,4,4,Color("faf5e9"))
		r(2,-17,4,4,Color("faf5e9"))
		r(-8,-6,16,18,Color("b93f61"))
		r(-4,-6,8,18,Color("294875"))
		r(-11,-5,4,21,Color("b93f61"))
		r(8,-5,4,21,Color("b93f61"))
		r(-7,12,5,18,Color("294875"))
		r(3,12,5,18,Color("294875"))
	elif kind==1:
		r(-7,-20,14,15,Color("d4c3b3"))
		r(2,-20,3,15,Color("ae4a4b"))
		r(-7,-9,14,7,Color("4d3e3e"))
		r(-11,-3,22,23,Color("b7aca0"))
		r(-5,-3,4,23,Color("a04b4e"))
		r(-13,1,5,26,Color("c6b7a7"))
		r(9,1,5,26,Color("c6b7a7"))
		r(-11,20,22,9,Color("574953"))
		r(-9,28,7,18,Color("403d46"))
		r(3,28,7,18,Color("403d46"))
		r(18,-15,3,48,Color("8a6f55"))
		poly([Vector2(20,-15),Vector2(34,-22),Vector2(37,-4),Vector2(20,0)],Color("9bcfdb"))
	elif kind==2:
		poly([Vector2(-10,-19),Vector2(-15,-31),Vector2(-6,-28),Vector2(-3,-37),Vector2(2,-29),Vector2(10,-33),Vector2(9,-23),Vector2(16,-21),Vector2(9,-16)],Color("a9dff2"))
		r(-7,-23,16,20,Color("e4c5b1"))
		r(-6,-19,5,4,Color("f7fcff"))
		r(3,-19,5,4,Color("f7fcff"))
		r(-9,-3,22,31,Color("e6e6ec"))
		r(-3,-3,9,25,Color("85d4d1"))
		r(-10,27,9,20,Color("786a68"))
		r(5,27,8,20,Color("786a68"))
		r(12,6,16,7,Color("bac6b9"))
		r(25,6,8,7,Color("80df65"))
	else:
		r(-7,-15,14,16,Color("dfbd9e"))
		r(-8,-17,16,5,Color("6e5249"))
		r(-9,1,18,19,Color("f4d36b"))
		r(-8,20,6,16,Color("637fa2"))
		r(3,20,6,16,Color("637fa2"))
	draw_set_transform(Vector2.ZERO,0,Vector2.ONE)

func _draw() -> void:
	if host.mode!="multiverse" and not (host.mode=="paused" and host.before_pause=="multiverse"): return
	if stage>=6: return
	var c := Color(COLORS[stage])
	r(0,0,960,600,Color("101729"))
	match stage:
		0:
			for depth in range(3):
				for i in range(12):
					var x := fposmod(i*107+depth*33-age*(depth+1)*14+1200,1200)-100
					var h := 90+(i*73+depth*43)%200
					var y := 490-h
					r(x,y,82,h,Color("202747") if depth==0 else Color("424360"))
					for row in range(int(h/20.0)):
						for col in range(4): r(x+10+col*17,y+12+row*20,4,7,Color("8ba2bb55") if (i+row+col)%3 else Color("f2bd89"))
			r(0,489,960,5,Color("d19685"))
			var pos := Vector2(300+sin(age*1.2)*120,250+cos(age*1.2)*40)
			draw_line(Vector2(480,-20),pos-Vector2(0,60),Color("e7eaf3"),2)
			hero(pos,0)
		1:
			for i in range(7):
				var x := i*165-70
				poly([Vector2(x-160,440),Vector2(x+70,100+i%3*45),Vector2(x+270,440)],Color("3b6479") if i%2 else Color("28475f"))
				poly([Vector2(x+22,168+i%3*45),Vector2(x+70,100+i%3*45),Vector2(x+114,165+i%3*45)],Color("afc5cf"))
			r(0,440,960,90,Color("b4cbd0"))
			hero(Vector2(350,340),1)
			for i in range(60): r(fposmod(i*137+age*14,960),fposmod(i*73+age*22,530),2,2,Color("dcecf0aa"))
		2:
			for z in range(6):
				for x in range(14):
					var px := x*80-z*21
					var py := 375+z*25
					poly([Vector2(px,py),Vector2(px+40,py-15),Vector2(px+80,py),Vector2(px+40,py+16)],Color("77aa5c") if (x+z)%2 else Color("689b50"))
					poly([Vector2(px,py),Vector2(px+40,py+16),Vector2(px+40,py+40),Vector2(px,py+24)],Color("755540"))
			for x: int in [95,760]:
				r(x+26,260,26,125,Color("654b36"))
				r(x-10,195,95,84,Color("3a774d"))
			r(360,315,43,43,Color("79a45c"))
			r(366,326,9,10,Color("253f33"))
			r(389,326,9,10,Color("253f33"))
			r(375,339,15,13,Color("253f33"))
			r(365,358,33,65,Color("638c4c"))
		3:
			for i in range(9):
				var x := 45+i*104
				var y := 440-sin(i*0.8)*75
				poly([Vector2(x,y),Vector2(x+25,y-16),Vector2(x+88,y-16),Vector2(x+62,y)],Color("a17be1") if i%2 else Color("6bc2cf"))
				r(x,y,62,23,Color("7652b0"))
			var x := 345
			var y := 300+sin(age*2)*10
			r(x-26,y-45,52,45,Color("e3c885"))
			r(x-38,y,76,62,Color("6b9bdf"))
			r(x-57,y+3,19,52,Color("e3c885"))
			r(x+38,y+3,19,52,Color("e3c885"))
			r(x-34,y+62,28,52,Color("8fc576"))
			r(x+6,y+62,28,52,Color("8fc576"))
			r(x-14,y-28,5,5,Color("2c3342"))
			r(x+10,y-28,5,5,Color("2c3342"))
			txt("CHECKPOINT?!",700,200,20,Color("f5d58b"),true)
		4:
			r(90,105,780,378,Color("4c5358"))
			for i in range(8): r(100+i*94,110,3,260,Color("343d47"))
			r(105,345,750,20,Color("8a755b"))
			r(112,365,738,112,Color("494548"))
			for i in range(6):
				r(125+i*117,379,108,78,Color("6a6461"))
				r(158+i*117,388,38,5,Color("a1a4a2"))
			for i in range(8): r(130+i*82,320-i*19%50,15,25+i*19%50,Color("8ac9b1"))
			portal(Vector2(191,270),90,Color("98ec76"))
			hero(Vector2(400,323),2)
			hero(Vector2(540,345),3)
			var capture := clampf((age-1.2)/1.5,0,1)
			var miss := age>3.7
			if not miss: draw_line(Vector2(494,346),Vector2(690,300),Color("9dea73"),3)
			draw_rect(Rect2(690-68*capture,300-60*capture,136*capture,120*capture),Color("d37973") if miss else Color("9dea73"),false,3)
			for i in range(1,4): draw_line(Vector2(690-68*capture+i*34*capture,300-60*capture),Vector2(690-68*capture+i*34*capture,300+60*capture),Color("9dea73"),2)
			if miss:
				txt("CAPTURA FALHOU",690,390,18,Color("f09a95"),true)
				txt("Rick: EI! VOLTA AQUI!",480,166,20,Color("e6edcf"),true)
		5:
			for i in range(20): r(i*51,160+i*37%70,34,310,Color("24213d"))
			# Puppet silhouette, sunglasses, wings and strings match the following boss.
			poly([Vector2(330,230),Vector2(240,190),Vector2(290,320),Vector2(350,300)],Color("eab4d7"))
			poly([Vector2(410,230),Vector2(510,190),Vector2(460,320),Vector2(400,300)],Color("b9b0eb"))
			r(343,230,65,115,Color("c98abd"))
			r(350,170,50,60,Color("f3eadc"))
			r(353,188,21,14,Color("f5ce49"))
			r(378,188,21,14,Color("f38cc0"))
			portal(Vector2(755,297),96,Color("db8ad7"),age>1.8)
			for i in range(7): draw_line(Vector2(310+i*27,0),Vector2(665+i*20,250+i%2*80) if age>1.8 else Vector2(300+i*25,150),Color("81e7c9"),2)
			if age>1.8: txt("TELETRANSPORTE: BLOQUEADO",742,418,17,Color("f2b3da"),true)
			txt("CHEGA DE [[VIAGENS GRÁTIS]].",480,134,22,Color("f2b3da"),true)
	var soul_x := 625+sin(age*3)*42
	var soul_y := 300+cos(age*2.5)*33
	if stage==4 and age>3.7:
		soul_x = 690+(age-3.7)*120
		soul_y = 300-(age-3.7)*40
	elif stage==5 and age>1.8: soul_x = 680
	if stage<5: portal(Vector2(850,300),74,c)
	heart(Vector2(soul_x,soul_y),Color("fff0d0"))
	r(0,0,960,87,Color("080c19ed"))
	txt(TAGS[stage]+" · REALIDADE %02d" % (stage+1),36,31,12,c)
	txt(TITLES[stage],36,65,28,Color("f0e7f2"))
	txt("SALTO %d / 6" % (stage+1),815,49,14,c)
	r(0,494,960,106,Color("080c19ed"))
	txt("Rick errou. Você já estava em outro universo." if stage==4 and age>3.7 else LINES[stage],480,527,17,Color("d7ddea"),true)
	txt("ENTER / CLIQUE: PRÓXIMO SALTO · ESC: PAUSAR",480,582,12,Color("8c99ae"),true)
	for i in range(6):
		r(330+i*52,551,43,3,c if i<stage else Color("30364b"))
		if i==stage: r(330+i*52,551,43*age/DURATIONS[stage],3,c)
	if age<0.18: r(0,0,960,600,Color(c.r,c.g,c.b,(0.18-age)*3))
	if host.mode=="paused":
		r(0,0,960,600,Color("060910dd"))
		txt("PAUSADO · ESC PARA CONTINUAR",480,300,26,Color("efbb77"),true)
