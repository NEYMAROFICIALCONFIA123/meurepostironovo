'use strict';
// 2.5D renderer: projected world geometry + pixel sprites. Collision stays in 2D.
const view25={x:0,y:0,targetX:0,targetY:0};
function poly25(points,color){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fillStyle=color;ctx.fill()}
function project25(x,y,z){return [Math.round(480+(x-view25.x)*470/z),Math.round(111+(119-y+view25.y)*470/z)]}
function face25(points,c){poly25(points.map(p=>project25(...p)),c)}
function block25(x,y,z,w,h,d,colors){face25([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],colors[0]);face25([[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],colors[1]);face25([[x,y,z+d],[x,y,z],[x,y+h,z],[x,y+h,z+d]],colors[1]);face25([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],colors[2])}
function glow25(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function drawCorridor25D(){
 view25.x+=(view25.targetX-view25.x)*.025;view25.y+=(view25.targetY-view25.y)*.025;
 rect(0,0,960,600,'#060914');ctx.save();ctx.beginPath();ctx.rect(0,0,960,324);ctx.clip();
 const backdrop=ctx.createLinearGradient(0,0,0,330);backdrop.addColorStop(0,'#0a1027');backdrop.addColorStop(.5,'#292139');backdrop.addColorStop(1,'#101320');ctx.fillStyle=backdrop;ctx.fillRect(0,0,960,330);
 // The far sanctuary: nested recessed arches and a luminous mosaic window.
 for(let i=0;i<7;i++){let inset=i*11;rect(320+inset,-60+inset,320-inset*2,248-inset,'#'+['39334d','191b32','51445f','202039','6c5266','27253e','a57979'][i]);}
 rect(399,17,162,156,'#302b47');rect(409,25,142,141,'#b3777e');rect(418,32,124,128,'#e4aa89');rect(426,39,109,116,'#eab78e');
 for(let row=0;row<7;row++)for(let col=0;col<7;col++){const palette=['#dca187','#b37b87','#775b83','#dfb58e','#8c7199'];rect(427+col*15,40+row*16,13,14,palette[(col+row*2)%5]);}rect(477,25,6,140,'#41364c');rect(409,93,142,5,'#41364c');
 glow25(480,93,200,'#edb59030');
 // Checkered marble floor, projected from world space, far-to-near.
 for(let z=1800;z>=150;z-=90)for(let x=-720;x<720;x+=90){let c=(Math.round(x/90)+Math.round(z/90))%2===0?'#282839':'#1b2031';face25([[x,0,z],[x+88,0,z],[x+88,0,z+88],[x,0,z+88]],c);face25([[x+4,.2,z+4],[x+84,.2,z+4],[x+84,.2,z+5],[x+4,.2,z+5]],'#74647924');}
 // Warm reflection in the marble; a separate transparent depth layer.
 for(let z=1000;z>=240;z-=25){const p=project25(0,.5,z),w=70*470/z;rect(p[0]-w/2+Math.sin(z*.17)*5,p[1],w,2,'#e9ba8b13');}
 // Shafts of stained-glass light, behind pillars and character.
 ctx.globalCompositeOperation='screen';poly25([[418,65],[443,70],[320,324],[150,324]],'#b9876b0c');poly25([[491,46],[522,50],[788,324],[547,324]],'#b9baf116');poly25([[445,63],[460,63],[419,324],[346,324]],'#f3cfab14');ctx.globalCompositeOperation='source-over';
 // Receding, extruded columns. The capitals and bases have real projected faces.
 for(const z of [1100,820,580,390,255])for(const side of [-1,1]){const x=side*255-21;
  block25(x-15,0,z-10,72,8,55,['#534155','#252239','#827087']);
  block25(x-9,8,z-6,60,10,47,['#44374e','#211e32','#6f5970']);
  block25(x,18,z,42,205,36,['#49415b','#23263d','#736780']);
  block25(x+5,20,z-.4,5,197,1,['#8e7284','#55445f','#ae8a91']);
  block25(x+30,20,z-.5,5,197,1,['#2d2b44','#22253d','#64506c']);
  block25(x-7,219,z-5,56,9,46,['#65516b','#30273f','#9b7e87']);
  block25(x-14,228,z-9,70,10,53,['#70586f','#30273e','#ad8590']);
  // Small sconces and flickering amber points of light.
  const p=project25(x+20,117,z-4),s=470/z;rect(p[0]-3*s,p[1],6*s,14*s,'#6e5064');rect(p[0]-2*s,p[1]-6*s,4*s,9*s,'#f5c79a');glow25(p[0],p[1]-4*s,38*s,'#ffb77230');
 }
 // Grounding shadows and soft reflected silhouette.
 ctx.save();ctx.translate(480,318);ctx.scale(1,.19);ctx.fillStyle='#03071699';ctx.beginPath();ctx.arc(0,0,76,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.save();ctx.globalAlpha=.08;ctx.translate(0,399);ctx.scale(1,-.28);sans();ctx.restore();
 // Sprite is independent of the perspective camera: its silhouette remains legible.
 ctx.save();ctx.translate(-view25.x*.12,-view25.y*.1);sans();ctx.restore();
 if(blue||round>=4)glow25(500,181,45,'#56dff52d');
 for(let i=0;i<56;i++){let z=1+(i%4)*.4,x=(i*131.71+Math.sin(t*.23+i)*12-view25.x*z)%960,y=(i*59.3-t*(3+i%5))%320;if(y<0)y+=320;rect(x,y,i%7===0?2:1,i%7===0?2:1,i%3===0?'#f8d2aa70':'#9aaada44');}
 const vignette=ctx.createRadialGradient(480,180,110,480,190,530);vignette.addColorStop(0,'#070a1200');vignette.addColorStop(1,'#040713c9');ctx.fillStyle=vignette;ctx.fillRect(0,0,960,330);
 const fog=ctx.createLinearGradient(0,285,0,327);fog.addColorStop(0,'#06091400');fog.addColorStop(1,'#060914');ctx.fillStyle=fog;ctx.fillRect(0,285,960,42);ctx.restore();
}
function drawArena25D(){
 // Physical bevel around a front-facing interaction plane. No perspective distortion
 // is applied to the collision plane, so hitboxes still match every visible attack.
 poly25([[277,323],[683,323],[699,308],[261,308]],'#43445e');
 poly25([[261,308],[277,323],[277,491],[261,475]],'#191f34');
 poly25([[683,323],[699,308],[699,475],[683,491]],'#10182c');
 poly25([[277,491],[683,491],[699,505],[261,505]],'#141d30');
 rect(263,309,434,2,'#9b849d');rect(262,310,2,164,'#514763');
 glow25(480,493,220,blue?'#3188c915':'#c39e6d0d');
 for(const [x,y] of [[265,313],[688,313],[265,481],[688,481]]){rect(x,y,7,7,'#a597ab');rect(x+2,y+2,3,3,'#292e44');}
}
canvas25Pointer();
function canvas25Pointer(){document.addEventListener('pointermove',e=>{view25.targetX=(e.clientX/(window.innerWidth||1440)-.5)*13;view25.targetY=(e.clientY/(window.innerHeight||900)-.5)*5});}
