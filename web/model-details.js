import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {random,hash32} from './world-layout.mjs';
export function blockAvatar(x,z,api){
 const {group,mesh,mat}=api,g=group(x,0,z);
 const rounded=(x,y,z,w,h,d,c,r=.055)=>mesh(new RoundedBoxGeometry(w,h,d,3,r),mat(c),[x,y,z],g);
 rounded(0,1.22,0,.72,.82,.4,'#467ca9');
 const head=mesh(new THREE.CylinderGeometry(.27,.27,.48,28),mat('#dfbd79'),[0,1.91,0],g);
 for(const s of[-1,1]){rounded(s*.2,.4,0,.29,.74,.3,'#649c61');rounded(s*.2,.08,.08,.31,.17,.44,'#39474c');rounded(s*.49,1.2,0,.22,.77,.28,'#dfbd79');rounded(s*.49,.79,.03,.23,.13,.29,'#cfa86d');mesh(new THREE.SphereGeometry(.027,12,8),mat('#2d3540'),[s*.09,1.98,.253],g);rounded(s*.2,.44,.157,.23,.05,.02,'#90b780',.008);}
 rounded(0,1.86,.26,.13,.025,.025,'#5e4b38',.008);
 rounded(0,1.29,.21,.37,.3,.035,'#b6d1d0',.02);rounded(0,1.29,.235,.22,.16,.02,'#497496',.01);
 for(let i=0;i<3;i++)rounded(0,1.01+i*.07,.211,.58,.016,.02,'#6296b3',.004);
 return g;
}
export function finishActor(g,type,seed,api){
 const {mesh,mat,box,line}=api,rng=random(hash32(seed^type.length*7919));
 const detail=(pos,size,c,r=.015)=>mesh(new RoundedBoxGeometry(...size,2,r),mat(c),pos,g);
 // Tailored torso profile avoids the previous disconnected sphere/cube silhouette.
 if(type!=='roblox'){
  const old=g.children.find(m=>m.isMesh&&Math.abs(m.position.y-1.38)<.001);if(old)old.visible=false;
  const points=[[.22,.94],[.27,1.08],[.29,1.35],[type==='war'?.38:.33,1.59],[.26,1.68]].map(p=>new THREE.Vector2(...p));
  const cloth=mesh(new THREE.LatheGeometry(points,28),mat({spider:'#a72d46',war:'#b9afa0',rick:'#e1e6df',morty:'#ddbc58'}[type]),[0,0,0],g);cloth.scale.z=.64;
  for(const s of[-1,1]){detail([s*.18,.55,.115],[.14,.055,.05],type==='spider'?'#92283c':'#6a6a68');detail([s*.47,1.12,.105],[.15,.065,.07],type==='rick'?'#bbc8c2':type==='war'?'#866d4c':'#476581');}
 }
 if(type==='war'){
  for(const s of[-1,1]){for(let i=0;i<4;i++)detail([s*.17,.77-i*.045,.254],[.085,.018,.024],'#b49b6f',.004);for(let i=0;i<3;i++)detail([s*.47,1.1-i*.06,.02],[.18,.04,.2],'#6c543b');}
  for(let i=0;i<5;i++)line([-.45,1.63-i*.035,.2],[-.24,1.65-i*.035,.2],'#c4af84',.009,g);
 }else if(type==='rick'){
  for(let i=0;i<3;i++)detail([-.18,1.48+i*.045,.292],[.025,.1,.02],['#9ebcbd','#849b77','#ba9c76'][i],.003);
  detail([.69,1.08,.285],[.2,.035,.02],'#d1e1c9');
  for(let i=0;i<4;i++)detail([.64+i*.04,.99,.27],[.018,.03,.02],i%2?'#81c48f':'#a3b2a2',.002);
 }else if(type==='spider'){
  for(let s of[-1,1])for(let i=0;i<3;i++)line([s*.08,2.19-i*.04,.16],[s*.17,2.12-i*.04,.14],'#6f263b',.004,g);
 }else if(type==='roblox'){
  for(let i=0;i<3;i++)detail([-.25+i*.25,1.57,.217],[.09,.04,.03],['#c5d7cf','#98b9c3','#d8c79e'][Math.floor(rng()*3)]);
 }
 g.userData.modelVariant=Math.floor(rng()*10000);
 return g;
}
export function refineNeo(g,api){
 const {mesh,mat,line}=api;
 for(const m of g.children)if(Math.abs(m.position.x)>0.9&&Math.abs(m.position.y-1.5)<.02)m.visible=false;
 for(const s of[-1,1]){
  const outline=new THREE.Shape();outline.moveTo(s*.38,1.2);outline.quadraticCurveTo(s*1.2,2.1,s*2.25,2.65);outline.quadraticCurveTo(s*1.9,1.1,s*.85,.95);outline.closePath();
  const wing=mesh(new THREE.ExtrudeGeometry(outline,{depth:.09,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025}),mat(s<0?'#c9a7c0':'#a5accf',.35,.4),[0,0,-.32],g);
  for(let i=0;i<4;i++)line([s*.8,1.24+i*.08,-.18],[s*(1.48+i*.12),1.7+i*.16,-.18],'#665c85',.018,g);
  const ring=mesh(new THREE.TorusGeometry(.14,.035,8,20),mat('#c4b5d2',.6,.25),[s*.7,1,.12],g);
  for(let j=0;j<3;j++){const finger=mesh(new RoundedBoxGeometry(.045,.22,.06,2,.014),mat('#d7cadc'),[s*.99+(j-1)*.055,.26,.16],g);}
 }
 for(let i=0;i<5;i++)mesh(new RoundedBoxGeometry(.035,.035,.025,1,.005),mat('#a1a6bb',.6,.3),[(i-2)*.12,.9,.272],g);
 return g;
}
