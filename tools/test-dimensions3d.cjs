// Optional GPU/browser smoke test: npm exec playwright install chromium first.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE,
      args:['--no-sandbox','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1200,height:1000}});
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(process.env.GAME_URL || 'http://127.0.0.1:3000');
    await page.click('#start');await page.waitForFunction(()=>window.GameVoices.status().loaded===10);assert.equal(await page.evaluate(()=>window.GameVoices.status().error),null);
    await page.evaluate(()=>{startMultiverse();state='paused';previous='multiverse';});
    for(let index=0;index<6;index++){
      const result=await page.evaluate(i=>{mv.stage=i;mv.age=i===4?4.2:2.3;draw();return window.Dimension3D.stats();},index);
      assert.equal(result.webgl,true,`Scene ${index} must use WebGL`);
      assert.equal(result.error,null);
      const traversal=await page.evaluate(()=>{Dimension3D.travel(0,-280);mv.age+=.01;draw();const far=Dimension3D.streaming();Dimension3D.travel(0,8);mv.age+=.01;draw();return far;});
      assert.equal(traversal.chunks,9,`World ${index} must stream without retaining old terrain`);
      assert.equal(traversal.rendered,9);

      assert.ok(result.props>20,'Generated dimensions must be populated');assert.ok(result.batches>=5,'Environment must be rendered with instanced 3D models');assert.ok(result.cells>=200,'The entire terrain must be covered');
    }
    const regeneration=await page.evaluate(()=>{
      mv.stage=1;mv.age=1;
      Dimension3D.newRun(12345);draw();const first=Dimension3D.inspect();
      Dimension3D.newRun(12345);draw();const second=Dimension3D.inspect();
      Dimension3D.newRun(67890);draw();const changed=Dimension3D.inspect();
      return {a:first.signature,b:second.signature,c:changed.signature,seed:changed.seed};
    });
    assert.equal(regeneration.a,regeneration.b,'Explicit seed must reproduce the rendered world');
    assert.notEqual(regeneration.a,regeneration.c,'Changing seed must rebuild the rendered world');
    assert.equal(regeneration.seed,67890);
    const streamed=await page.evaluate(()=>{
      mv.stage=1;mv.age=1;draw();const original=Dimension3D.inspect().signature;
      const snapshots=[];
      for(const z of [-400,-800,-1200,-1600,1200,1600,0]){
        Dimension3D.travel(0,z);mv.age+=.01;draw();snapshots.push(Dimension3D.streaming());
      }
      Dimension3D.travel(0,8);mv.age+=.01;draw();
      return {snapshots,original,returned:Dimension3D.inspect().signature};
    });
    assert.equal(streamed.original,streamed.returned,'Returning to origin must keep the seeded story layout');
    for(const snapshot of streamed.snapshots){assert.equal(snapshot.chunks,9);assert.equal(snapshot.rendered,9);}
    const resourceCounts=streamed.snapshots.map(s=>s.geometries);
    assert.ok(Math.max(...resourceCounts)-Math.min(...resourceCounts)<80,'Discarded regions must release geometry, not accumulate resources');
    await page.keyboard.press('l');
    assert.equal(await page.evaluate(()=>mv.free),false,'Paused preview must not accidentally toggle exploration');
    await page.evaluate(()=>{state='multiverse';});await page.keyboard.press('l');
    assert.equal(await page.evaluate(()=>mv.free),true);
    await page.evaluate(()=>{mv.age=200;mvUpdate(.01);});
    assert.equal(await page.evaluate(()=>mv.stage),1,'Free exploration must disable automatic world changes');
    await page.evaluate(()=>{mv.free=false;state='paused';mv.stage=4;mv.age=14.6;mv.mortySpoken=false;state='multiverse';mvUpdate(.01);state='paused';});
    await page.waitForFunction(()=>GameVoices.status().key==='morty'&&GameVoices.status().playing);
    assert.equal(await page.evaluate(()=>GameVoices.speaker()),'morty','Morty must have his own voice, not Rick or narrator');
    await page.evaluate(()=>{GameVoices.stop();});
    await page.evaluate(()=>{mv.stage=1;mv.age=1;draw();});
    const pitchBefore=await page.evaluate(()=>window.Dimension3D.stats().rotation[0]);
    const pitchUp=await page.evaluate(()=>{window.Dimension3D.look(0,-100);mv.age+=.01;draw();return window.Dimension3D.stats().rotation[0]});
    assert.ok(pitchUp>pitchBefore,'Mouse up must look UP, never inverted');
    const pitchDown=await page.evaluate(()=>{window.Dimension3D.look(0,200);mv.age+=.01;draw();return window.Dimension3D.stats().rotation[0]});
    assert.ok(pitchDown<pitchUp,'Mouse down must look DOWN');
    await page.evaluate(()=>{mv.stage=2;mv.age=1;draw();});
    const before=await page.evaluate(()=>window.Dimension3D.stats());
    await page.evaluate(()=>{keys.add('w');keys.add('arrowright');state='multiverse';});
    await page.waitForFunction(()=>window.Dimension3D.stats().position[2]<7.5);
    await page.evaluate(()=>{keys.clear();});
    const after=await page.evaluate(()=>window.Dimension3D.stats());
    assert.notEqual(before.position[2],after.position[2],'W moves the first-person camera');
    assert.notEqual(before.rotation[1],after.rotation[1],'Arrows turn the first-person camera');
    const canvas=page.locator('#game');
    const area=await canvas.boundingBox();
    await page.evaluate(()=>{mv.age=1;});
    const currentStage=await page.evaluate(()=>mv.stage);
    await page.mouse.move(area.x+area.width*.5,area.y+area.height*.5);
    await page.mouse.down();
    await page.mouse.move(area.x+area.width*.65,area.y+area.height*.52,{steps:4});
    await page.mouse.up();
    assert.equal(await page.evaluate(()=>mv.stage),currentStage,'Dragging looks around instead of skipping');
    await page.evaluate(()=>{mv.stage=5;mv.age=2;mvNext();});
    assert.equal(await page.evaluate(()=>state),'dr_attack','NEO battle still starts after the 3D sequence');
    await page.evaluate(()=>{startMultiverse();});
    await page.waitForFunction(()=>window.GameVoices.status().playing);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>window.GameVoices.status().paused),true,'Esc must pause narration');
    await page.click('#resume');
    await page.waitForFunction(()=>window.GameVoices.status().playing);
    await page.keyboard.press('m');assert.equal(await page.evaluate(()=>window.GameVoices.status().muted),true);
    await page.keyboard.press('m');assert.equal(await page.evaluate(()=>window.GameVoices.status().muted),false);
    await page.evaluate(()=>{start()});assert.equal(await page.evaluate(()=>window.GameVoices.status().playing),false,'Restart stops the previous speaker');
    assert.deepEqual(errors,[]);
    console.log('PASS: six streamed infinite 3D worlds, terrain traversal/unload, free exploration, Morty voice, correct vertical camera, movement/look, drag, NEO transition, 10 decoded voice clips, voice pause/resume/mute and reset.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
