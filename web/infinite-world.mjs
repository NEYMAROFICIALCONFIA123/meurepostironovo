import {generateLayout} from './world-layout.mjs';
// Bounded working set, unbounded coordinates. Revisiting a discarded chunk regenerates it.
export function createInfiniteWorld(stage,seed,onLoad=()=>{},onUnload=()=>{}){
 const chunks=new Map(),halfX=stage===4?12:48,halfZ=stage===4?18:48;
 const coords=(x,z)=>[Math.floor((x+halfX)/(halfX*2)),Math.floor((z+halfZ)/(halfZ*2))];
 let center='';
 function get(cx,cz){const key=cx+','+cz;if(!chunks.has(key)){const plan=generateLayout(stage,seed,{chunkX:cx,chunkZ:cz,streamed:true});chunks.set(key,plan);onLoad(plan,key);}return chunks.get(key);}
 function update(x,z){const [cx,cz]=coords(x,z),key=cx+','+cz;if(center===key)return;center=key;
  // Remove first: neither GPU resources nor collision plans accumulate while exploring.
  for(const [k,p]of chunks)if(Math.abs(p.chunkX-cx)>1||Math.abs(p.chunkZ-cz)>1){onUnload(p,k);chunks.delete(k);}
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)get(cx+i,cz+j);
 }
 function groundAt(x,z){const [cx,cz]=coords(x,z);return get(cx,cz).groundAt(x,z);}
 function blocked(x,z,r=.27){const [x0,z0]=coords(x-r,z-r),[x1,z1]=coords(x+r,z+r);for(let j=z0;j<=z1;j++)for(let i=x0;i<=x1;i++)if(get(i,j).blocked(x,z,r))return true;return false;}
 function move(x,z,dx,dz,r=.27){const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));for(let i=0;i<n;i++){update(x,z);if(!blocked(x+dx/n,z,r))x+=dx/n;if(!blocked(x,z+dz/n,r))z+=dz/n;}update(x,z);return {x,z};}
 update(0,8);
 return {chunks,update,groundAt,blocked,move,center:()=>center};
}
