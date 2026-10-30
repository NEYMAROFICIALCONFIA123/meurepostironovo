// Deterministic state-machine smoke tests without browser dependencies.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const noop = () => {};
const context = new Proxy({}, {get: (_, key) => key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({addColorStop:noop}) : noop, set:()=>true});
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {getContext:()=>context,addEventListener:noop,focus:noop,hidden:false,style:{},open:false,showModal:noop,close:noop});
  return elements.get(id);
}
const sandbox = {console, Math, Set, document:{querySelector:element,addEventListener:noop},window:{addEventListener:noop},requestAnimationFrame:noop,setInterval:noop};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('web/scene25d.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('web/firstperson.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('web/game.js','utf8'),sandbox);
const run = s => vm.runInContext(s,sandbox);
run('audio={resume:()=>{}};muted=true;start(); practice=true;');
assert.equal(run('state'),'attack');
run('for(let i=0;i<100;i++)update(.02)');
assert.ok(run('hazards.length') > 0, 'Gate hazards must remain alive after spawning');
run('for(let i=0;i<500;i++)update(.02)');
assert.equal(run('state'),'menu');
run('sel=0;confirm();attackCursor=.5;confirm()');
assert.equal(run('wins'),1);
assert.equal(run('blue'),true);
run('soul.y=479; keys.add("arrowup");update(.02);keys.clear()');
assert.ok(run('vy') < 0, 'Blue soul must jump');
run('state="menu"; hp=20;sel=2;confirm()');
assert.equal(run('hp'),58);
assert.equal(run('items'),2);
run('pause()');assert.equal(run('state'),'paused');run('pause()');assert.equal(run('state'),'attack');
run('state="aim";attackCursor=0;confirm()');assert.equal(run('wins'),1,'Miss must not progress');
run('state="aim";attackCursor=.5;wins=7;confirm()');assert.equal(run('state'),'win');
run('start();practice=false;hp=5;inv=0;hurt()');assert.equal(run('state'),'dead');
run('confirm()');assert.equal(run('hp'),92);
for (let wave = 0; wave < 8; wave++) {
  run(`round=${wave};age=0;spawn=0;hazards=[];practice=true;state='attack';`);
  run('for(let i=0;i<560;i++){update(.02);draw()}');
  assert.equal(run('state'),'menu', `Wave ${wave} should end in action menu`);
}
console.log('PASS: 8 wave variants, gate persistence, movement, gravity/jump, items, pause, aiming, victory, death/retry and draw.');

run('start();age=4;toggleFP()');assert.equal(run('state'),'fps');
run('keys.add("w");update(.1);keys.clear()');assert.ok(run('fp.z')<680);
run('throwSans()');assert.equal(run('state'),'fps','Cannot throw from far away');
run('toggleFP()');assert.equal(run('state'),'attack');assert.equal(run('age'),4,'Escape must freeze battle time');
run('toggleFP();fp.z=440;fp.x=0;fp.yaw=Math.PI;throwSans()');assert.equal(run('state'),'fps','Must aim at Sans');
run('fp.yaw=0;throwSans()');assert.equal(run('state'),'throw');
run('for(let i=0;i<130;i++){update(.02);draw()}');assert.equal(run('state'),'escape_win');
run('confirm()');assert.equal(run('state'),'attack');assert.equal(run('fp.won'),false);
console.log('PASS: first-person escape/return, movement, distance/aim gates, toss animation, alternate victory and reset.');
