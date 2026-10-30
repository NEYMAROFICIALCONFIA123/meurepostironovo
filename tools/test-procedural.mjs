import assert from 'node:assert/strict';
import {generateLayout,random} from '../web/world-layout.mjs';
let tested=0,tiles=0;
for(let stage=0;stage<6;stage++){
 const signatures=new Set();
 for(let seed=1;seed<=64;seed++){
  const a=generateLayout(stage,seed),b=generateLayout(stage,seed),rng=random(seed);
  assert.deepEqual(a.props,b.props,'Same seed must reproduce the same layout');
  assert.equal(a.signature,b.signature);
  signatures.add(a.signature);
  assert.equal(a.heights.length,a.nz+1);
  assert.ok(a.props.length>(stage===4?25:200),'Density must not collapse to an empty map');
  assert.equal(a.blocked(a.spawn.x,a.spawn.z),false,'Spawn must be clear');
  for(let j=0;j<a.nz;j++)for(let i=0;i<a.nx;i++){
   assert.equal(a.heights[j].length,a.nx+1);
   const x=-a.halfX+i*2+1,z=-a.halfZ+j*2+1;
   assert.ok(Number.isFinite(a.groundAt(x,z)),'Every terrain cell must have a finite surface');tiles++;
  }
  for(let z=a.spawn.z;z>=a.portal.z;z-=.5)assert.equal(a.blocked(0,z),false,'Main route to portal must never be obstructed');
  const reached=a.move(0,8,0,a.portal.z-8);
  assert.ok(Math.abs(reached.z-a.portal.z)<1e-8,'Continuous movement must reach the portal');
  let p={x:0,z:8};
  for(let i=0;i<200;i++){
   p=a.move(p.x,p.z,(rng()-.5)*8,(rng()-.5)*8);
   assert.equal(a.blocked(p.x,p.z),false,'Collision sliding cannot leave the camera inside a model');
   assert.ok(Number.isFinite(a.groundAt(p.x,p.z)));
  }
  for(const c of a.colliders)assert.equal(a.blocked(c.x,c.z),true,'Solid model centers must block traversal');
  assert.equal(a.blocked(a.bounds.maxX+1,0),true,'World limits must block exits into the void');
  tested++;
 }
 assert.ok(signatures.size>60,'Different seeds must change the layout, not just decorative colors');
}
console.log(`PASS: ${tested} seeded layouts, ${tiles.toLocaleString()} covered cells, determinism, variable layouts, density, clear portal routes, collision and world limits.`);
