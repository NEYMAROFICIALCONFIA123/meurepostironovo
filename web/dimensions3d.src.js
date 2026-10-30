import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  premiumHumanoid,
  mountainMesh,
} from "./premium-worlds.js";
import {blockAvatar,finishActor,refineNeo} from "./model-details.js";
import {createInfiniteWorld} from "./infinite-world.mjs";
import {buildProceduralDimension} from "./procedural-dimensions.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
let composer, renderPass, layout, stream, runSeed = 1;
const chunkGroups=new Map();
// True WebGL 3D. All geometry is generated locally; no models, CDNs or textures to fetch.
let renderer,
  scene,
  camera,
  world,
  stage = -1,
  actors = {},
  materials = new Map(),
  geometries = new Set(),
  look = { x: 0, y: 0 },
  offset = { x: 0, z: 0 },
  lastAge = 0,
  failure = null;
const v = (x, y, z) => new THREE.Vector3(x, y, z);
function mat(color, metalness = 0, roughness = 0.72, emissive = false) {
  const key = [color, metalness, roughness, emissive].join();
  if (!materials.has(key))
    materials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
        emissive: emissive ? color : 0,
        emissiveIntensity: emissive ? 1.8 : 0,
        flatShading: false,
      }),
    );
  return materials.get(key);
}
function mesh(geo, color, pos, parent = world, metal = 0) {
  geometries.add(geo);
  const m = new THREE.Mesh(
    geo,
    typeof color === "string" || typeof color === "number"
      ? mat(color, metal)
      : color,
  );
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function box(x, y, z, w, h, d, c, parent = world, metal = 0) {
  return mesh(new THREE.BoxGeometry(w, h, d), c, [x, y, z], parent, metal);
}
function cyl(x, y, z, rt, rb, h, c, parent = world, sides = 12) {
  if (stage === 1 && rt === 0 && h > 8)
    return mountainMesh(x, y, z, rb, h, c, parent, { mesh, materials });
  return mesh(
    new THREE.CylinderGeometry(rt, rb, h, sides),
    c,
    [x, y, z],
    parent,
  );
}
function orb(x, y, z, r, c, parent = world) {
  return mesh(new THREE.IcosahedronGeometry(r, 1), c, [x, y, z], parent);
}
function line(a, b, c, r = 0.018, parent = world) {
  const direction = v(...b).sub(v(...a));
  const m = cyl(0, 0, 0, r, r, direction.length(), c, parent, 8);
  m.position.copy(
    v(...a)
      .add(v(...b))
      .multiplyScalar(0.5),
  );
  m.quaternion.setFromUnitVectors(v(0, 1, 0), direction.normalize());
  return m;
}
function group(x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  world.add(g);
  return g;
}
function neon(x, y, z, w, h, c, parent = world) {
  return box(x, y, z, w, h, 0.045, mat(c, 0, 0.35, true), parent);
}
function portal(x, y, z, c) {
  const g = group(x, y, z);
  for (let i = 0; i < 3; i++) {
    const ring = mesh(
      new THREE.TorusGeometry(1.25 + i * 0.11, 0.045, 8, 64),
      mat(c, 0.2, 0.3, true),
      [0, 0, 0],
      g,
    );
    ring.scale.y = 1.35;
  }
  const disk = mesh(
    new THREE.CircleGeometry(1.22, 48),
    new THREE.MeshBasicMaterial({
      color: c,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    }),
    [0, 0, -0.02],
    g,
  );
  const light = new THREE.PointLight(c, 7, 8, 2);
  g.add(light);
  g.userData.disk = disk;
  return g;
}
function humanoid(type,x,z){
 const api={group,mesh,mat,box,cyl,line,neon};
 const actor=type==='roblox'?blockAvatar(x,z,api):premiumHumanoid(type,x,z,api);
 return finishActor(actor,type,layout?.seed??runSeed,api);
}
function neo(x, z) {
  const g = group(x, 1, z);
  mesh(
    new RoundedBoxGeometry(0.8, 1.2, 0.5, 4, 0.08),
    mat("#b86baf", 0.45, 0.32),
    [0, 1.1, 0],
    g,
  );
  box(0, 1.15, 0.27, 0.42, 0.6, 0.05, "#ebbadc", g);
  neon(0, 1.2, 0.31, 0.23, 0.22, "#79ffcc", g);
  mesh(
    new RoundedBoxGeometry(0.58, 0.66, 0.44, 4, 0.08),
    mat("#e8ddcb", 0.15, 0.4),
    [0, 2.1, 0],
    g,
  );
  box(0, 2.45, -0.05, 0.63, 0.16, 0.5, "#232232", g);
  box(-0.18, 2.2, 0.24, 0.28, 0.18, 0.07, "#f4c943", g);
  box(0.18, 2.2, 0.24, 0.28, 0.18, 0.07, "#df64b3", g);
  const nose = box(0.4, 2.04, 0.16, 0.45, 0.13, 0.15, "#e8ddcb", g);
  nose.rotation.z = -0.15;
  box(0, 1.87, 0.24, 0.49, 0.1, 0.04, "#171526", g);
  for (let i = -2; i <= 2; i++)
    box(i * 0.08, 1.9, 0.27, 0.04, 0.05, 0.02, "#fff1db", g);
  for (let side of [-1, 1]) {
    box(side * 0.25, 0.27, 0, 0.21, 0.6, 0.23, "#dbc2e9", g);
    box(side * 0.3, -0.06, 0.14, 0.4, 0.16, 0.45, "#eee1ef", g);
    const wing = box(
      side * 1.08,
      1.5,
      -0.18,
      1.5,
      0.9,
      0.18,
      side < 0 ? "#ebb7d7" : "#b7b3e9",
      g,
    );
    wing.rotation.z = side * 0.5;
    const inner = box(side * 1.05, 1.5, -0.065, 1.05, 0.57, 0.05, "#67578e", g);
    inner.rotation.z = side * 0.5;
    box(side * 0.78, 1, 0.12, 0.4, 0.2, 0.26, "#e3cbe4", g);
    box(side * 0.98, 0.64, 0.12, 0.17, 0.65, 0.2, "#9b91be", g);
    line([side * 0.6, 2, 0], [side * 1.4, 8, -1], "#64cbb5", 0.014, g);
  }
  return refineNeo(g,{mesh,mat,line});
}
function setup(index) {
  if (!renderer) {
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(960, 600, false);
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch (e) {
      failure = String(e);
      return false;
    }
  }
  if (scene) {
    for (const g of geometries) g.dispose();
    geometries.clear();
    for (const m of materials.values()) {
      m.map?.dispose();
      m.bumpMap?.dispose();
      m.dispose();
    }
    materials.clear();
    scene.traverse((o) => {
      if(o.isInstancedMesh)o.dispose();
      if (o.isLight && o.shadow) o.shadow.dispose();
    });
  }
  scene = new THREE.Scene();
  world = new THREE.Group();
  scene.add(world);
  actors = {};
  stage = index;
  look = { x: 0, y: 0 };
  offset = { x: 0, z: 0 };
  lastAge = 0;
  const skies = [
    "#23344d",
    "#90adba",
    "#91c4d8",
    "#9daace",
    "#363e45",
    "#141b30",
  ];
  scene.background = new THREE.Color(skies[index]);
  scene.fog = new THREE.Fog(
    skies[index],
    index === 4 ? 15 : 28,
    index === 4 ? 60 : 200,
  );
  camera = new THREE.PerspectiveCamera(64, 1.6, 0.08, 320);
  camera.rotation.order = "YXZ";
  scene.add(camera);
  for (const side of [-1, 1]) {
    const hand = box(
      side * 0.39,
      -0.43,
      -0.7,
      0.13,
      0.22,
      0.19,
      "#d9bda3",
      camera,
    );
    hand.rotation.z = side * -0.2;
    hand.castShadow = false;
    const sleeve = box(
      side * 0.42,
      -0.61,
      -0.65,
      0.18,
      0.25,
      0.22,
      "#344b70",
      camera,
    );
    sleeve.castShadow = false;
  }
  const hemi = new THREE.HemisphereLight(
    index === 4 ? "#c1d5dc" : "#c9e3ff",
    index === 2 ? "#506c32" : "#514755",
    index === 4 ? 1.4 : 2.2,
  );
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(
    index === 0 ? "#f4af91" : index === 4 ? "#d1e9cc" : "#fff0d7",
    index === 4 ? 2 : 3.3,
  );
  sun.position.set(-8, 15, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -28,
    right: 28,
    top: 28,
    bottom: -28,
    near: 0.1,
    far: 65,
  });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  chunkGroups.clear();
  let storyLoaded=false;
  stream=createInfiniteWorld(index,runSeed,(plan,key)=>{
    const before=new Set(world.children),oldGeometry=new Set(geometries),chunk=new THREE.Group();
    const story=plan.chunkX===0&&plan.chunkZ===0&&!storyLoaded;
    const made=buildProceduralDimension(plan,{story,box,cyl,orb,line,neon,group,mesh,mat,world,materials,scene,geometries,humanoid,neo,portal});
    if(story){layout=plan;actors=made;storyLoaded=true;}
    for(const object of [...world.children])if(!before.has(object)&&!Object.values(made).includes(object))chunk.add(object);
    const actorGeometry=new Set();for(const actor of Object.values(made))actor.traverse?.(o=>{if(o.geometry)actorGeometry.add(o.geometry);});
    chunk.userData.resources=[...geometries].filter(g=>!oldGeometry.has(g)&&!actorGeometry.has(g));
    world.add(chunk);chunkGroups.set(key,chunk);
  },(plan,key)=>{
    const chunk=chunkGroups.get(key);if(!chunk)return;
    chunk.traverse(o=>{if(o.isInstancedMesh)o.dispose();});
    for(const geometry of chunk.userData.resources){geometry.dispose();geometries.delete(geometry);}
    const groundKey=`generated-ground:${key}`;materials.get(groundKey)?.dispose();materials.delete(groundKey);
    world.remove(chunk);chunkGroups.delete(key);
  });
  scene.fog=new THREE.Fog(scene.background, index===4?9:32,index===4?20:67);
  if (!composer) {
    composer = new EffectComposer(renderer);
    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(960, 600), 0.24, 0.35, 1.3),
    );
    composer.addPass(new OutputPass());
  } else {
    renderPass.scene = scene;
    renderPass.camera = camera;
  }
  return true;
}
function animate(age, dt, keys) {
  const step = Math.min(0.05, dt);
  look.x -=
    ((keys?.has("arrowright") ? 1 : 0) - (keys?.has("arrowleft") ? 1 : 0)) *
    step *
    0.8;
  look.y -=
    ((keys?.has("arrowdown") ? 1 : 0) - (keys?.has("arrowup") ? 1 : 0)) *
    step *
    0.55;
  look.y = Math.max(-0.65, Math.min(0.65, look.y));
  const side = (keys?.has("d") ? 1 : 0) - (keys?.has("a") ? 1 : 0),
    forward = (keys?.has("w") ? 1 : 0) - (keys?.has("s") ? 1 : 0),
    speed = keys?.has("shift") ? 5 : 3;
  const norm = Math.hypot(side, forward) || 1;
  const dx=(Math.cos(look.x)*side-Math.sin(look.x)*forward)*step*speed/norm;
  const dz=(-Math.sin(look.x)*side-Math.cos(look.x)*forward)*step*speed/norm;
  const next=stream.move(offset.x,offset.z+8,dx,dz);
  offset.x=next.x;offset.z=next.z-8;
  camera.position.set(next.x,stream.groundAt(next.x,next.z)+1.72,next.z);
  camera.rotation.set(look.y,look.x,0,'YXZ');
  for (const actor of [actors.hero, actors.rick, actors.morty]) {
    if (actor && stage !== 0) {
      const dx = camera.position.x - actor.position.x,
        dz = camera.position.z - actor.position.z,
        dist = Math.hypot(dx, dz);
      if (dist < 0.65 && dist > 0.001) {
        const tx=actor.position.x+dx/dist*.65,tz=actor.position.z+dz/dist*.65;
        if(!stream.blocked(tx,tz)){camera.position.x=tx;camera.position.z=tz;offset.x=tx;offset.z=tz-8;camera.position.y=stream.groundAt(tx,tz)+1.72;}
      }
    }
  }
  for (const actor of [actors.hero, actors.rick, actors.morty]) {
    if (actor?.userData.mouth) {
      const speaking = window.GameVoices?.speaker() === actor.userData.speaker;
      actor.userData.mouth.scale.y = speaking
        ? 1 + Math.abs(Math.sin(age * 18)) * 2
        : 1;
    }
  }
  if (actors.portal) {
    actors.portal.rotation.z = age * 0.12;
    actors.portal.userData.disk.material.opacity =
      0.25 + Math.sin(age * 3) * 0.08;
  }
  if (stage === 0) {
    actors.hero.position.set(
      -2.4 + Math.sin(age * 1.3) * 1.5,
      3 + Math.cos(age * 1.3) * 0.6,
      -6,
    );
    actors.hero.rotation.z = Math.sin(age * 1.3) * 0.3;
  }
  if (stage === 3)
    actors.hero.position.y = layout.groundAt(-1.4,-3)+Math.max(0,Math.sin(age*2))*.3;
  if (stage === 4) {
    const fired = age > 6.5 && age < 11.3;
    actors.cage.visible = age > 6.5;
    actors.beam.visible = fired;
    const progress = THREE.MathUtils.clamp((age - 6.5) / 2.3, 0, 1);
    actors.cage.position.z = -3 + progress * 6;
    actors.cage.scale.setScalar(0.3 + progress * 0.7);
    if (age > 11.3) {
      actors.cage.rotation.z = 0.3 + (age - 11.3);
      actors.cage.position.x = 1 + (age - 11.3) * 2;
      actors.cage.position.y = Math.max(0.3, 1.7 - (age - 11.3));
    }
    actors.rick.rotation.y = Math.sin(age) * 0.12;
  }
  if (stage === 5) {
    actors.neo.position.y = 1 + Math.sin(age * 2) * 0.12;
    actors.lock.visible = age > 1.8;
    actors.lock.rotation.z = age * 0.2;
  }
}
window.Dimension3D = {
  render(index, age, keys) {
    if (failure) return null;
    if (stage === index && lastAge === age && keys === null)
      return renderer.domElement;
    if (stage !== index && !setup(index)) return null;
    const dt = Math.max(0, age - lastAge);
    lastAge = age;
    animate(age, dt, keys);
    composer.render();
    return renderer.domElement;
  },
  look(dx, dy) {
    look.x -= dx * 0.003;
    look.y = THREE.MathUtils.clamp(look.y - dy * 0.003, -0.65, 0.65);
  },
  newRun(seed) {
    runSeed=seed===undefined?(window.crypto?.getRandomValues?window.crypto.getRandomValues(new Uint32Array(1))[0]:(Math.random()*4294967296)>>>0):(Number(seed)>>>0);
    stage=-1;return runSeed;
  },
  groundAt(x,z){return stream?.groundAt(x,z);},
  travel(x,z){if(!stream)return;stream.update(x,z);offset={x,z:z-8};camera.position.set(x,stream.groundAt(x,z)+1.72,z);},
  streaming(){return stream?{center:stream.center(),chunks:stream.chunks.size,rendered:chunkGroups.size,geometries:geometries.size,gpuGeometries:renderer.info.memory.geometries}:null;},
  inspect(){return layout?{seed:runSeed,signature:layout.signature,cells:layout.terrainCells,props:layout.props,colliders:layout.colliders,bounds:layout.bounds}:null;},
  reset() {
    stage = -1;
  },
  stats() {
    return {
      stage,seed:runSeed,signature:layout?.signature,cells:layout?.terrainCells,props:layout?.props.length,batches:[...chunkGroups.values()].reduce((n,g)=>n+g.children.filter(o=>o.isInstancedMesh).length,0),
      webgl: !!renderer,
      error: failure,
      objects: scene?.children[0]?.children.length,
      position: camera?.position.toArray(),
      rotation: camera?.rotation.toArray(),
    };
  },
};
