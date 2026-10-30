// Pure seeded generation. Shared by rendering, collision, diagnostics and CPU tests.
// Deterministic chunks: shared world-coordinate noise keeps adjoining terrain seamless.
export function hash32(value) {
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return (value ^ (value >>> 16)) >>> 0;
}
export function random(seed) {
  let state = seed >>> 0;
  return () => { state = (state + 0x6d2b79f5) >>> 0; let n = state; n = Math.imul(n ^ (n >>> 15), n | 1); n ^= n + Math.imul(n ^ (n >>> 7), n | 61); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; };
}
export function generateLayout(stage, runSeed, options = {}) {
  const seed = hash32((runSeed >>> 0) ^ Math.imul(stage + 1, 7919)), rng = random(hash32(seed ^ Math.imul(options.chunkX||0,374761393) ^ Math.imul(options.chunkZ||0,668265263)));
  const indoor = stage === 4, halfX = indoor ? 12 : 48, halfZ = indoor ? 18 : 48, cell = 2;
  const originX=(options.chunkX||0)*halfX*2,originZ=(options.chunkZ||0)*halfZ*2;
  const nx = halfX, nz = halfZ, props = [], colliders = [], buckets = new Map();
  const bounds = {minX:originX-halfX+(options.streamed?0:2),maxX:originX+halfX-(options.streamed?0:2),minZ:originZ-halfZ+(options.streamed?0:2),maxZ:originZ+halfZ-(options.streamed?0:2)};
  function noise(x,z) {
    const ix=Math.floor(x), iz=Math.floor(z), sx=x-ix, sz=z-iz, u=sx*sx*(3-2*sx),v=sz*sz*(3-2*sz);
    const n=(a,b)=>hash32(seed ^ Math.imul(a,374761393) ^ Math.imul(b,668265263))/4294967295;
    return (n(ix,iz)*(1-u)+n(ix+1,iz)*u)*(1-v)+(n(ix,iz+1)*(1-u)+n(ix+1,iz+1)*u)*v;
  }
  function naturalHeight(x,z) {
    if(stage!==1&&stage!==2)return 0;
    // A connected, flat cross-shaped route is kept independent of the terrain noise.
    const taper=Math.min(1,Math.max(0,(Math.min(Math.abs(x),Math.abs(z))-3)/7));
    return (noise(x*.07,z*.07)*(stage===1?6:2.7)+noise(x*.19,z*.19)*.55)*taper;
  }
  const heights=Array.from({length:nz+1},(_,j)=>Array.from({length:nx+1},(_,i)=>naturalHeight(originX-halfX+i*cell,originZ-halfZ+j*cell)));
  function groundAt(x,z) {
    x=Math.max(-halfX,Math.min(halfX-.00001,x-originX));z=Math.max(-halfZ,Math.min(halfZ-.00001,z-originZ));
    const fx=(x+halfX)/cell,fz=(z+halfZ)/cell,i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j;
    if(stage===2)return Math.floor((heights[j][i]+heights[j][i+1]+heights[j+1][i]+heights[j+1][i+1])/4*2)/2;
    const a=heights[j][i],b=heights[j][i+1],c=heights[j+1][i],d=heights[j+1][i+1];
    return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
  }
  function reserved(x,z,r=0) {
    return Math.abs(x)<3.4+r || Math.abs(z)<3.4+r || Math.hypot(x,z-8)<3+r || Math.hypot(x,z+20)<3+r;
  }
  function add(kind,x,z,w=1,d=1,solid=true) {
    const p={kind,x,z,y:groundAt(x,z),w,d,h:1+rng()*2,variant:Math.floor(rng()*7),yaw:(rng()-.5)*.3};
    props.push(p);
    if(solid){const c={x,z,hx:w/2,hz:d/2};colliders.push(c);const bx0=Math.floor((x-c.hx)/8),bx1=Math.floor((x+c.hx)/8),bz0=Math.floor((z-c.hz)/8),bz1=Math.floor((z+c.hz)/8);for(let bx=bx0;bx<=bx1;bx++)for(let bz=bz0;bz<=bz1;bz++){const key=bx+','+bz;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(c);}}
    return p;
  }
  const spacing=indoor?4:8;
  // Jittered stratified placement: every unreserved district receives a primary model.
  // Randomness changes layouts, dimensions, silhouettes and details, not just colors.
  for(let z=-halfZ+spacing/2;z<halfZ;z+=spacing)for(let x=-halfX+spacing/2;x<halfX;x+=spacing){
    const px=originX+x+(rng()-.5)*spacing*.3,pz=originZ+z+(rng()-.5)*spacing*.3;
    if(indoor){if(!reserved(px,pz,1.2))add(rng()>.45?'machine':'storage',px,pz,1.6,1.6);continue;}
    if(reserved(px,pz,stage===0?2.8:stage===5?1.5:stage===3?1.2:.6))continue;
    const kind=['building',rng()>.35?'pine':'boulder',rng()>.18?'oak':'boulder',rng()>.5?'pavilion':'pillar','storage',rng()>.35?'tower':'conduit'][stage];
    const size=stage===0?4.2+rng()*1.4:stage===5?2.5:stage===3?2:kind==='pine'?4.1:kind==='oak'?3.2:kind==='boulder'?3.8:1;
    if(reserved(px,pz,size/2+.1))continue;
    const p=add(kind,px,pz,size,size);p.h=stage===0?9+rng()*23:stage===5?7+rng()*13:3+rng()*4;
    // Complementary ground cover ensures the district is dressed from eye level too.
    for(let k=0;k<3;k++){const dx=(rng()-.5)*5,dz=(rng()-.5)*5;if(!reserved(px+dx,pz+dz,.3))add(stage===0?'bollard':stage===3?'stud':stage===5?'terminal':'groundcover',px+dx,pz+dz,.25,.25,false);}
  }
  // Procedurally spaced route furniture stays outside the collision-free central lane.
  if(!indoor)for(let z=-halfZ+5;z<halfZ-3;z+=6+rng()*2)for(const side of[-1,1]){
    const x=originX+side*(4.6+rng()*.5);if(Math.abs(z+originZ)<4)continue;
    add(stage===0?'streetlamp':stage===1?'rune':stage===2?'flower':stage===3?'railpost':'neonpost',x,z+originZ,.35,.35,stage!==2);
  }
  if(indoor&&!options.streamed){
    for(let x=-9;x<10;x+=2.6){add('cabinet',x,-16,2.3,1.3);add('bottle',x,-15.5,.25,.25,false);}
    for(let z=-12;z<16;z+=3.4)for(const side of[-1,1])add('cabinet',side*10.8,z,1,2.6);
  }
  function blocked(x,z,r=.27) {
    if(!options.streamed&&(x-r<bounds.minX||x+r>bounds.maxX||z-r<bounds.minZ||z+r>bounds.maxZ))return true;
    const nearby=new Set();for(let bx=Math.floor((x-r)/8);bx<=Math.floor((x+r)/8);bx++)for(let bz=Math.floor((z-r)/8);bz<=Math.floor((z+r)/8);bz++)for(const c of buckets.get(bx+','+bz)||[])nearby.add(c);
    for(const c of nearby){const dx=Math.max(Math.abs(x-c.x)-c.hx,0),dz=Math.max(Math.abs(z-c.z)-c.hz,0);if(dx*dx+dz*dz<r*r)return true;}return false;
  }
  function move(x,z,dx,dz,r=.27) {
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));for(let n=0;n<steps;n++){if(!blocked(x+dx/steps,z,r))x+=dx/steps;if(!blocked(x,z+dz/steps,r))z+=dz/steps;}return {x,z};
  }
  const signature=hash32(props.reduce((n,p)=>n^hash32(Math.round(p.x*100)+Math.round(p.z*100)*7919+p.variant*71),seed));
  return {stage,seed,originX,originZ,streamed:!!options.streamed,chunkX:options.chunkX||0,chunkZ:options.chunkZ||0,runSeed:runSeed>>>0,cell,nx,nz,halfX,halfZ,bounds,heights,props,colliders,groundAt,reserved,blocked,move,signature,spawn:{x:0,z:8},portal:{x:0,z:indoor?-12:-20},terrainCells:nx*nz};
}
