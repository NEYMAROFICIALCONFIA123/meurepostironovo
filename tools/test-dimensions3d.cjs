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
    await page.click('#start');
    await page.evaluate(()=>{startMultiverse();state='paused';previous='multiverse';});
    for(let index=0;index<6;index++){
      const result=await page.evaluate(i=>{mv.stage=i;mv.age=i===4?4.2:2.3;draw();return window.Dimension3D.stats();},index);
      assert.equal(result.webgl,true,`Scene ${index} must use WebGL`);
      assert.equal(result.error,null);
      assert.ok(result.objects>15,'Scene must contain volumetric meshes');
    }
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
    assert.deepEqual(errors,[]);
    console.log('PASS: all six real-WebGL worlds, mesh counts, first-person movement/look, drag input and transition to NEO.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
