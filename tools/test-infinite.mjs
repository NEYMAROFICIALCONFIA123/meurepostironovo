import assert from 'node:assert/strict';
import {generateLayout} from '../web/world-layout.mjs';
import {createInfiniteWorld} from '../web/infinite-world.mjs';
let seams=0,loaded=0,unloaded=0;
for(let stage=0;stage<6;stage++){
 const hx=stage===4?12:48,hz=stage===4?18:48;
 for(const cx of[-100,-2,-1,0,1,2,100])for(const cz of[-100,-1,0,1,100]){
  const a=generateLayout(stage,4242,{chunkX:cx,chunkZ:cz,streamed:true});
  const b=generateLayout(stage,4242,{chunkX:cx+1,chunkZ:cz,streamed:true});
  const c=generateLayout(stage,4242,{chunkX:cx,chunkZ:cz+1,streamed:true});
  for(let j=0;j<=a.nz;j++){assert.equal(a.heights[j][a.nx],b.heights[j][0],'East/west heights must share identical edge vertices');seams++;}
  for(let i=0;i<=a.nx;i++){assert.equal(a.heights[a.nz][i],c.heights[0][i],'North/south edges must have no missing or mismatched vertices');seams++;}
  assert.equal(a.blocked(a.originX,a.originZ),false,'Chunk limits are not invisible walls');
 }
 const world=createInfiniteWorld(stage,4242,()=>loaded++,()=>unloaded++);
 const original=world.chunks.get('0,0').signature;
 for(let i=-20;i<=20;i++){
  const z=i*hz*2;world.update(0,z);
  assert.equal(world.chunks.size,9,'Only the surrounding 3x3 chunks remain loaded');
  assert.ok(Number.isFinite(world.groundAt(0,z)));
  assert.equal(world.blocked(0,z),false,'Main road must remain traversable beyond the old boundary');
  const p=world.move(0,z,0,hz*2+2);
  assert.ok(Math.abs(p.z-(z+hz*2+2))<1e-6,'Walk seamlessly between chunks without walls');
 }
 world.update(0,8);assert.equal(world.chunks.get('0,0').signature,original,'Revisiting an unloaded region must regenerate the same layout');
}
assert.ok(unloaded>100);
console.log(`PASS: six infinite worlds, ${seams} exact shared terrain edge samples, long-distance movement, deterministic revisits, bounded memory (${loaded} loads / ${unloaded} unloads).`);
