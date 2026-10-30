'use strict';
// Original pixel-art vignettes, not embedded versions of the referenced games.
const mv={stage:0,age:0,active:false,stops:[
 {name:'HOMEM-ARANHA',tag:'NOVA YORK · REALIDADE 01',line:'Você atravessou a teia do multiverso.',duration:16,color:'#ed7185'},
 {name:'GOD OF WAR',tag:'MIDGARD · REALIDADE 02',line:'Até os deuses ficaram confusos com essa visita.',duration:16,color:'#8fdaec'},
 {name:'MINECRAFT',tag:'MUNDO DE BLOCOS · REALIDADE 03',line:'Você quase virou um bloco de determinação.',duration:17,color:'#b4e58b'},
 {name:'ROBLOX',tag:'OBBY IMPOSSÍVEL · REALIDADE 04',line:'Checkpoint? Não. Outro teletransporte.',duration:16,color:'#f4cd70'},
 {name:'RICK E MORTY',tag:'GARAGEM DO RICK · REALIDADE 05',line:'Rick: uma alma fora do roteiro? Vou capturar você!',duration:28,color:'#b3ee75'},
 {name:'SPAMTON NEO',tag:'DESTINO BLOQUEADO · REALIDADE 06',line:'VOCÊ NÃO VAI A LUGAR NENHUM, [[BIG SHOT]]!',duration:18,color:'#ec9bd4'}
]};
function startMultiverse(){mv.free=false;mv.seed=window.Dimension3D?.newRun();window.GameVoices?.play("city");mv.missSpoken=false;mv.mortySpoken=false;mv.stage=0;mv.age=0;mv.active=true;state='multiverse';keys.clear();document.exitPointerLock?.();$('#status').textContent='ERRO NO ROTEIRO · SALTO MULTIVERSAL';}
function mvNext(){if(state!=='multiverse'||mv.age<.65)return;mv.stage++;mv.age=0;mv.missSpoken=false;mv.mortySpoken=false;window.GameVoices?.stop();if(mv.stage<6)window.GameVoices?.play(["city","snow","blocks","obby","rick","spamton"][mv.stage]);sfx(230+mv.stage*70,.15,'triangle',.04);if(mv.stage>=mv.stops.length){mv.active=false;startCrossover();drWave();}}
function mvUpdate(dt){if(state!=='multiverse')return false;mv.age+=dt;t+=dt;if(mv.stage===4&&mv.age>11.3&&!mv.missSpoken){mv.missSpoken=true;window.GameVoices?.play("rick-miss");}if(mv.stage===4&&mv.age>14.5&&!mv.mortySpoken){mv.mortySpoken=true;window.GameVoices?.play("morty");}if(!mv.free&&mv.age>=mv.stops[mv.stage].duration)mvNext();return true;}
function mvDraw(){
 if(state!=='multiverse'&&!(state==='paused'&&previous==='multiverse'))return false;
 const scene=mv.stops[mv.stage],a=mv.age,paused=state==='paused';
 const frame=window.Dimension3D?.render(mv.stage,a,paused?null:keys);
 if(frame){ctx.imageSmoothingEnabled=true;ctx.drawImage(frame,0,0,960,600);ctx.imageSmoothingEnabled=false;}
 else{rect(0,0,960,600,'#101729');text('AS DIMENSÕES PRECISAM DE WEBGL 2',480,270,21,scene.color,'center');text('Ative a aceleração gráfica no navegador ou use o projeto Godot.',480,310,13,'#d7ddea','center');}
 rect(0,0,960,80,'#080c19ba');text(scene.tag+' · 3D / PRIMEIRA PESSOA',30,28,10,scene.color);text(scene.name,30,61,24,'#f0e7f2');text(`SALTO ${mv.stage+1} / 6`,930,34,12,scene.color,'right');text(`SEMENTE ${mv.seed??'—'} · INFINITO`,930,58,9,'#9cafbd','right');
 rect(478,298,4,4,'#ffffffaa');
 if(mv.stage===4&&a>11.3){rect(319,115,322,37,'#172318bb');text('CAPTURA FALHOU · RICK ERROU!',480,139,14,'#b3ee75','center');}
 if(mv.stage===5&&a>1.8){rect(285,114,390,37,'#34203ccc');text('TELETRANSPORTE: BLOQUEADO',480,138,15,'#f2b3da','center');}
 rect(0,496,960,104,'#080c19d9');text(window.GameVoices?.speaker()?'◖ VOZ · '+window.GameVoices.speaker().toUpperCase():'ÁUDIO ORIGINAL EM PORTUGUÊS',480,524,11,'#9bb6bd','center');
 for(let i=0;i<6;i++){rect(330+i*52,546,43,3,i<mv.stage?scene.color:'#30364b');if(i===mv.stage)rect(330+i*52,546,43*Math.min(1,a/scene.duration),3,scene.color);}
 text('L: EXPLORAÇÃO LIVRE · WASD: ANDAR · SETAS / ARRASTE: OLHAR · ENTER: SALTAR · ESC: PAUSAR',480,577,10,'#a7b5c9','center');
 if(a<.18){ctx.globalAlpha=(.18-a)*3;rect(0,0,960,600,scene.color);ctx.globalAlpha=1;}
 $('#mode').textContent=mv.stage===5?'SPAMTON ESTÁ TRAVANDO O TELETRANSPORTE':(mv.free?'EXPLORAÇÃO LIVRE · ENTER PARA O PRÓXIMO MUNDO':'DIMENSÕES INFINITAS · L ATIVA EXPLORAÇÃO LIVRE');$('#escapebtn').textContent='REALIDADE 3D';return true;
}
document.addEventListener('pointermove',e=>{if(state==='multiverse'&&e.buttons===1)window.Dimension3D?.look(e.movementX,e.movementY);});

let mvPointerDown=null;
document.addEventListener('pointerdown',e=>{if(e.target.id==='game'&&state==='multiverse')mvPointerDown={x:e.clientX,y:e.clientY};});
document.addEventListener('pointerup',e=>{if(mvPointerDown&&state==='multiverse'&&Math.hypot(e.clientX-mvPointerDown.x,e.clientY-mvPointerDown.y)<5)mvNext();mvPointerDown=null;});

window.addEventListener("keydown",e=>{if(e.code==="KeyL"&&state==="multiverse"&&!e.repeat){mv.free=!mv.free;e.preventDefault();}});
