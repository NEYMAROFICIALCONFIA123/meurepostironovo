import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
// Seeded layout -> instanced environmental models. All playable ground is connected.
export function buildProceduralDimension(layout, api) {
 const {mesh,mat,world,geometries,materials,group,humanoid,neo,portal}=api;
 const pools=new Map(),unit={box:new THREE.BoxGeometry(1,1,1),round:new RoundedBoxGeometry(1,1,1,2,.08),cyl:new THREE.CylinderGeometry(1,1,1,12),cone:new THREE.ConeGeometry(1,1,9),sphere:new THREE.SphereGeometry(1,14,10)};
 for(const g of Object.values(unit))geometries.add(g);
 const dummy=new THREE.Object3D();
 function part(type,x,y,z,w,h,d,color,ry=0,metal=0,emissive=false){const key=[type,color,metal,emissive].join('|');if(!pools.has(key))pools.set(key,{type,material:mat(color,metal,emissive?.28:.78,emissive),items:[]});pools.get(key).items.push({x,y,z,w,h,d,ry});}
 const B=(x,y,z,w,h,d,c,ry=0,metal=0)=>part('box',x,y,z,w,h,d,c,ry,metal);
 const R=(x,y,z,w,h,d,c,ry=0,metal=0)=>part('round',x,y,z,w,h,d,c,ry,metal);
 const C=(x,y,z,r,h,c)=>part('cyl',x,y,z,r,h,r,c);
 const S=(x,y,z,w,h,d,c)=>part('sphere',x,y,z,w,h,d,c);
 const E=(x,y,z,w,h,d,c)=>part('box',x,y,z,w,h,d,c,0,0,true);
 // A continuous indexed mesh for non-voxel biomes, with identical height sampling
 // in the camera controller. No hand-placed planes or gaps between separate chunks.
 if(layout.stage!==2){
  const positions=[],colors=[],indices=[],terrainColors=['#626974','#bbcbd1','#6d9955','#7b9cae','#7c8880','#35445b'];
  for(let j=0;j<=layout.nz;j++)for(let i=0;i<=layout.nx;i++){const x=layout.originX-layout.halfX+i*2,z=layout.originZ-layout.halfZ+j*2;positions.push(x,layout.heights[j][i],z);const c=new THREE.Color(terrainColors[layout.stage]);if(layout.stage===3){c.set(['#b19bd2','#7cb7c5','#c6ae88'][(i+j)%3]);}else if(layout.reserved(x,z)){c.multiplyScalar(layout.stage===0?.65:1.06);}else c.multiplyScalar(.93+((i*7+j*3)%9)*.012);colors.push(c.r,c.g,c.b);}
  for(let j=0;j<layout.nz;j++)for(let i=0;i<layout.nx;i++){const a=j*(layout.nx+1)+i,b=a+1,c=a+layout.nx+1,d=c+1;indices.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9});materials.set(`generated-ground:${layout.chunkX},${layout.chunkZ}`,m);mesh(geo,m,[0,0,0]);
 }else for(let j=0;j<layout.nz;j++)for(let i=0;i<layout.nx;i++){const x=layout.originX-layout.halfX+i*2+1,z=layout.originZ-layout.halfZ+j*2+1,y=layout.groundAt(x,z);B(x,y-.6,z,2,1.2,2,'#806347');B(x,y-.035,z,2,.07,2,(i+j)%3?'#6d9b50':'#7da659');}
 // Route dressing doesn't obstruct the collision-free cross-shaped main road.
 for(let z=layout.bounds.minZ;z<layout.bounds.maxZ;z+=2){if(layout.stage===0)B(layout.originX,.012,z,.09,.015,.7,'#d9c5a0');if(layout.stage===1)R(layout.originX,.015,z,1.3,.035,1.1,'#98aeb3',Math.sin(z)*.3);if(layout.stage===5)E(layout.originX,.02,z,.045,.025,1.1,'#89bcba');}
 if(layout.stage===3)for(let x=layout.originX-46;x<layout.originX+47;x+=4)for(let z=layout.originZ-46;z<layout.originZ+47;z+=4){B(x,.012,z,.03,.025,3.8,'#577891');B(x+2,.012,z+2,3.8,.025,.03,'#577891');}
 for(const p of layout.props){const {x,z,y,variant:v}=p;const shade=['#4c6374','#566976','#655f6b','#425e65'][v%4];
  switch(p.kind){
   case 'building':case 'tower':{
    const h=p.h,cyber=p.kind==='tower';B(x,y+h/2,z,p.w,h,p.d,cyber?'#35455e':shade);R(x,y+.35,z,p.w+.25,.7,p.d+.25,'#778389');B(x,y+h+.1,z,p.w+.28,.24,p.d+.28,'#a1a3a2');const top=(v%3)*1.4;R(x,y+h+.5,z,p.w*.55,.9+top,p.d*.5,'#61737b');
    for(let row=0;row<Math.floor(h/1.7)-1;row++)for(let col=0;col<3;col++)for(const side of[-1,1]){const wx=x+(col-1)*p.w*.26,wy=y+1.5+row*1.7,wz=z+side*(p.d/2+.018);B(wx,wy,wz,.42,.75,.04,'#25394b');if((row+col+v)%4!==0)E(wx,wy,wz+side*.026,.33,.62,.018,cyber?((row+v)%2?'#8cbdba':'#c08cb3'):((row+v)%3?'#a6bec7':'#ecd1a0'));}
    if(v%2)for(let i=0;i<3;i++)C(x-p.w*.3+i*.25,y+h+1.6,z,.045,2,'#6e818c');break;}
   case 'pine':{
    const h=p.h;C(x,y+h*.35,z,.15,h*.7,'#706154');for(let j=0;j<5;j++){const r=(h*.28)*(1-j*.15);part('cone',x,y+h*.35+j*h*.12,z,r,h*.43,r,j%2?'#476a68':'#5c7a76');part('cone',x,y+h*.39+j*h*.12,z,r*.86,h*.3,r*.86,'#c4d6d8');}break;}
   case 'oak':{
    B(x,y+1.5,z,.65,3,.65,'#70583c');for(let j=0;j<3;j++)B(x+Math.sin(v+j)*.4,y+2.8+j*.65,z+Math.cos(v+j)*.4,3-j*.45,1.1,3-j*.45,['#507e45','#679552','#7aa55d'][j]);break;}
   case 'boulder':S(x,y+.5,z,1+p.h*.12,.65,1.1,'#93a6ac');S(x+.2,y+.8,z,.7,.15,.7,'#d0dfe0');break;
   case 'pavilion':{
    for(const sx of[-1,1])for(const sz of[-1,1])C(x+sx*.8,y+1.5,z+sz*.8,.09,3,'#d3c4a4');R(x,y+3.05,z,2.2,.3,2.2,['#a88cc9','#7fbec5','#d4b67f'][v%3]);R(x,y+.12,z,2.2,.22,2.2,'#b7c7d3');break;}
   case 'pillar':C(x,y+p.h/2,z,.45,p.h,'#9cb6ca');R(x,y+.2,z,1.2,.4,1.2,'#c5d0d6');part('sphere',x,y+p.h+.25,z,.32,.32,.32,'#c4ddd5',0,.2,true);break;
   case 'machine':{
    R(x,y+1,z,1.4,2,1.4,'#526e6b',0,.2);B(x,y+1.3,z+.72,1,.7,.04,'#293d42');E(x,y+1.3,z+.75,.88,.52,.02,'#93c4b6');for(let j=0;j<3;j++){C(x+(j-1)*.32,y+2.35,z,.1,.6,'#98b6ac');part('sphere',x+(j-1)*.32,y+2.69,z,.12,.12,.12,'#a6d4a2',0,0,true);}break;}
   case 'storage':case 'cabinet':{
    const h=p.kind==='cabinet'?2.05:1.4+v*.08;R(x,y+h/2,z,p.w,h,p.d,p.kind==='cabinet'?'#738d80':shade);for(let j=0;j<3;j++){B(x,y+.35+j*.45,z+p.d/2+.015,p.w*.84,.02,.02,'#425e5a');R(x,y+.48+j*.45,z+p.d/2+.035,p.w*.25,.045,.04,'#b9c7bd');}break;}
   case 'conduit':R(x,y+.8,z,2.2,1.6,2.2,'#4f6575');for(let i=0;i<3;i++)E(x,y+.4+i*.4,z+1.11,1.5,.06,.025,'#9cc5c0');break;
   case 'streetlamp':C(x,y+1.8,z,.06,3.6,'#7b8e9c');R(x,y+3.65,z,.45,.15,.35,'#9ba9af');E(x,y+3.56,z,.33,.06,.25,'#f5d8a3');break;
   case 'rune':R(x,y+.65,z,.42,1.3,.4,'#7b969b');E(x,y+.8,z+.21,.08,.55,.018,'#a4d8e1');break;
   case 'railpost':C(x,y+.6,z,.05,1.2,'#b3c8d4');part('sphere',x,y+1.22,z,.1,.1,.1,'#e5ceb1');break;
   case 'neonpost':B(x,y+1,z,.18,2,.18,'#6f8a9d');E(x,y+1.1,z+.11,.06,1.4,.025,'#a1cac4');break;
   case 'bottle':C(x,y+2.35,z,.12,.45,'#a8c9c0');C(x,y+2.65,z,.055,.2,'#d2dfce');break;
   case 'terminal':R(x,y+.7,z,.45,1.4,.45,'#5b7383');E(x,y+1.05,z+.24,.28,.3,.02,'#b6a7cf');break;
   case 'groundcover':if(layout.stage===2){B(x,y+.15,z,.12,.3,.12,'#75994f');B(x,y+.36,z,.25,.14,.25,v%2?'#d1ab72':'#bc89a3');}else S(x,y+.09,z,.3,.12,.28,'#bccfd1');break;
   case 'flower':B(x,y+.15,z,.07,.3,.07,'#5d8a4a');B(x,y+.34,z,.25,.16,.25,v%2?'#dac680':'#c597b5');break;
   case 'stud':C(x,y+.05,z,.13,.1,'#b6c7d4');break;
   default:R(x,y+.25,z,.25,.5,.25,'#8499a7');
  }
 }
 // An open laboratory roof replaces the closed garage: adjoining regions stay accessible.
 if(layout.stage===4){
  B(layout.originX,6.1,layout.originZ,24,.25,36,'#87988b');
  for(let z=layout.originZ-14;z<layout.originZ+17;z+=4)for(const x of[-5,5])E(layout.originX+x,5.68,z,3,.08,.2,'#d4e3d1');
 }
 for(const pool of pools.values()){
  const instance=new THREE.InstancedMesh(unit[pool.type],pool.material,pool.items.length);
  pool.items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.ry,0);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();instance.setMatrixAt(i,dummy.matrix);});
  instance.castShadow=pool.items.length<250;instance.receiveShadow=true;instance.instanceMatrix.needsUpdate=true;world.add(instance);
 }
 if(api.story===false||layout.chunkX!==0||layout.chunkZ!==0)return {};
 const actors={};
 if(layout.stage===0){actors.hero=humanoid('spider',-2.7,-6);actors.hero.position.y=3;api.line([-2,18,-10],[-2.7,5,-6],'#d5e3ee',.022);}
 if(layout.stage===1)actors.hero=humanoid('war',-2.3,-2.8);
 if(layout.stage===2){const c=group(-2,layout.groundAt(-2,-3),-3);api.box(0,1.45,0,.63,.65,.62,'#6d9c47',c);api.box(0,.7,0,.43,.87,.4,'#5a813d',c);for(const s of[-1,1]){api.box(s*.25,.19,.07,.27,.38,.65,'#527337',c);api.box(s*.17,1.52,.32,.13,.15,.02,'#182e23',c);}api.box(0,1.3,.32,.22,.15,.02,'#182e23',c);actors.creeper=c;}
 if(layout.stage===3)actors.hero=humanoid('roblox',-1.4,-3);
 if(layout.stage===4){actors.rick=humanoid('rick',-1.7,-4.1);actors.morty=humanoid('morty',.2,-5);actors.garagePortal=portal(-6,2.5,-16,'#87eb54');actors.cage=group(0,1.7,1);for(let i=0;i<4;i++){api.box(-1.1+i*.73,0,0,.035,2.1,.035,'#8cf77c',actors.cage);api.box(0,-1.05+i*.7,0,2.2,.035,.035,'#8cf77c',actors.cage);}actors.beam=api.line([-1,1.2,-4],[0,1.7,1],'#92ef77',.026);const light=new THREE.PointLight('#d2dacd',24,26,2);light.position.set(0,4,-5);api.scene.add(light);}
 if(layout.stage===5){actors.neo=neo(-1.5,-5);actors.lock=group(layout.portal.x,2,layout.portal.z+.2);for(let i=0;i<6;i++){const rod=api.box(0,0,.1,2.5,.07,.07,'#e094ce',actors.lock);rod.rotation.z=i*Math.PI/6;}}
 actors.portal=portal(layout.portal.x,2+layout.groundAt(layout.portal.x,layout.portal.z),layout.portal.z,layout.stage===4?'#8eee54':layout.stage===5?'#db79d3':'#8bd8ff');
 return actors;
}
