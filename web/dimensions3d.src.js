import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  premiumHumanoid,
  enrichWorld,
  mountainMesh,
} from "./premium-worlds.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
let composer, renderPass;
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
function humanoid(type, x, z) {
  if (type !== "roblox")
    return premiumHumanoid(type, x, z, {
      group,
      mesh,
      mat,
      box,
      cyl,
      line,
      neon,
    });
  const g = group(x, 0, z);
  const skin =
    type === "rick"
      ? "#d5b99d"
      : type === "spider"
        ? "#c13e53"
        : type === "war"
          ? "#b9b3ab"
          : "#edca83";
  const shirt = {
    rick: "#e3ecea",
    morty: "#e7c34e",
    spider: "#b52f48",
    war: "#aea79d",
    roblox: "#477ace",
  }[type];
  const pants = {
    rick: "#665b4e",
    morty: "#415e88",
    spider: "#223d70",
    war: "#403c40",
    roblox: "#6eae59",
  }[type];
  box(0, 1.23, 0, 0.66, 0.85, 0.38, shirt, g);
  for (let side of [-1, 1]) {
    box(side * 0.2, 0.4, 0, 0.23, 0.76, 0.26, pants, g);
    box(side * 0.2, 0.08, 0.09, 0.28, 0.17, 0.45, "#333344", g);
    box(
      side * 0.48,
      1.25,
      0,
      0.21,
      0.78,
      0.24,
      type === "rick" ? shirt : skin,
      g,
    );
    orb(side * 0.48, 0.83, 0, 0.12, skin, g);
  }
  if (type === "roblox") cyl(0, 1.97, 0, 0.3, 0.3, 0.47, skin, g, 20);
  else {
    box(0, 1.97, 0, 0.45, 0.55, 0.43, skin, g);
    for (let side of [-1, 1])
      box(
        side * 0.115,
        2.04,
        0.223,
        0.1,
        0.065,
        0.02,
        type === "spider" ? "#f4f0e6" : "#242633",
        g,
      );
    box(0, 1.84, 0.224, 0.16, 0.027, 0.02, "#59474b", g);
  }
  if (type === "spider") {
    box(0, 1.25, 0.2, 0.17, 0.23, 0.02, "#25324b", g);
    line([-0.22, 1.65, 0.2], [0.22, 1, 0.2], "#25324b", 0.013, g);
    line([0.22, 1.65, 0.2], [-0.22, 1, 0.2], "#25324b", 0.013, g);
  }
  if (type === "rick") {
    for (let i = 0; i < 9; i++) {
      const spike = mesh(
        new THREE.ConeGeometry(0.16, 0.48, 4),
        "#9ecbdc",
        [
          Math.cos((i * Math.PI) / 8) * 0.29,
          2.25 + Math.sin((i * Math.PI) / 8) * 0.18,
          0,
        ],
        g,
      );
      spike.rotation.z = -Math.cos((i * Math.PI) / 8) * 0.7;
    }
    box(0, 1.26, 0.21, 0.22, 0.75, 0.035, "#73bab5", g);
    box(0.66, 1.2, 0.14, 0.52, 0.19, 0.24, "#a7b4a3", g);
    neon(0.86, 1.21, 0.27, 0.16, 0.1, "#93ed53", g);
  }
  if (type === "morty") box(0, 2.23, 0, 0.48, 0.15, 0.45, "#654632", g);
  if (type === "war") {
    box(0.08, 2.02, 0.225, 0.085, 0.53, 0.022, "#a54445", g);
    box(0, 1.78, 0.225, 0.42, 0.16, 0.05, "#55433c", g);
    box(0, 0.84, 0, 0.73, 0.25, 0.45, "#554434", g);
    box(-0.27, 1.56, 0, 0.2, 0.35, 0.5, "#67483a", g);
    cyl(0.75, 1.12, 0, 0.035, 0.035, 1.6, "#65442d", g);
    const blade = box(0.93, 1.77, 0, 0.55, 0.48, 0.11, "#93c6d4", g, 0.7);
    blade.rotation.z = 0.22;
    neon(0.96, 1.77, 0.062, 0.16, 0.27, "#85dbf5", g);
  }
  return g;
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
  return g;
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
  if (index === 0) city();
  if (index === 1) snow();
  if (index === 2) voxels();
  if (index === 3) obby();
  if (index === 4) garage();
  if (index === 5) cyber();
  enrichWorld(index, {
    box,
    cyl,
    orb,
    line,
    neon,
    group,
    mesh,
    mat,
    world,
    materials,
    scene,
    geometries,
  });
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
  actors.portal = portal(
    index === 4 ? 3.7 : 3.4,
    2,
    -9,
    index === 4 ? "#8eee54" : index === 5 ? "#db79d3" : "#8bd8ff",
  );
  return true;
}
function city() {
  box(0, -0.3, 8, 13, 0.6, 18, "#48505e");
  box(0, 0.08, 2, 13, 0.2, 0.4, "#a6a2a1");
  for (let side of [-1, 1]) {
    box(side * 6.2, 0.35, 8, 0.25, 0.7, 18, "#676d78");
    for (let z = 0; z < 5; z++) {
      let h = 9 + ((z * 7 + side * 3 + 30) % 12);
      box(
        side * (10 + (z % 2) * 2),
        h / 2 - 8,
        -z * 14 - 9,
        9,
        h,
        10,
        z % 2 ? "#35475c" : "#3b3c52",
      );
      const frontZ = -z * 14 - 3.94;
      for (let row = 0; row < Math.floor(h / 1.1) - 1; row++)
        for (let col = 0; col < 5; col++)
          neon(
            side * (10 + (z % 2) * 2) - 3.3 + col * 1.6,
            row * 1.1 - 6.5,
            frontZ,
            0.53,
            0.63,
            (row + col + z) % 4 ? "#647f91" : "#ffcb8c",
          );
      for (let row = 0; row < 3; row++)
        box(
          side * (10 + (z % 2) * 2),
          -3 + row * 2.7,
          frontZ + 0.3,
          3.6,
          0.08,
          0.7,
          "#222a36",
          world,
          0.7,
        );
    }
  }
  box(0, -8.05, -25, 8, 0.1, 90, "#252d3d");
  for (let i = 0; i < 12; i++)
    box(0, -7.96, -i * 6, 0.12, 0.02, 2.7, "#ebc589");
  for (let i = 0; i < 4; i++) {
    box(-4 + i * 1.8, 0.5, 11, 1.1, 0.8, 1.5, "#677580");
    box(-4 + i * 1.8, 0.98, 11, 1.2, 0.15, 1.7, "#34414f");
  }
  actors.hero = humanoid("spider", -2.7, -6);
  actors.hero.position.y = 3;
  actors.web = line([-2, 18, -10], [-2.7, 5, -6], "#d5e3ee", 0.022);
}
function snow() {
  box(0, -0.2, -12, 70, 0.4, 80, "#c5d4d8");
  for (let i = 0; i < 18; i++) {
    let x = (i % 2 ? 1 : -1) * (12 + ((i * 7) % 24)),
      z = -8 - Math.floor(i / 2) * 9,
      h = 10 + ((i * 11) % 14);
    cyl(x, h / 2 - 0.1, z, 0, 7, h, i % 2 ? "#6d8590" : "#879da7", world, 5);
  }
  for (let i = 0; i < 22; i++) {
    const x = (i % 2 ? 1 : -1) * (5 + (i % 4) * 1.6),
      z = -i * 3;
    box(x, 1.5, z, 0.3, 3, 0.3, "#515d60");
    for (let j = 0; j < 3; j++)
      cyl(x, 2 + j * 0.65, z, 0, 1.1 - j * 0.24, 1.7, "#526d70", world, 5);
  }
  for (let i = 0; i < 15; i++) {
    const stone = orb(((i % 3) - 1) * 1.1, 0.01, 6 - i * 1.5, 0.55, "#a6b6bb");
    stone.scale.y = 0.12;
  }
  for (let side of [-1, 1]) {
    box(side * 3.3, 3, -13, 1.5, 6, 1.4, "#6c7e85");
    for (let i = 0; i < 5; i++)
      neon(side * 3.3, 1 + i * 0.8, -12.28, 0.15, 0.4, "#88d4e5");
  }
  box(0, 6, -13, 8, 0.9, 1.8, "#6c7e85");
  actors.hero = humanoid("war", -2.3, -2.8);
}
function pixelMaterial(color, seed) {
  const size = 16,
    data = new Uint8Array(size * size * 4),
    c = new THREE.Color(color).convertLinearToSRGB();
  for (let i = 0; i < size * size; i++) {
    let h = Math.sin((i + seed * 83) * 127.1) * 43758.5453;
    let n = 0.91 + (h - Math.floor(h)) * 0.14;
    data[i * 4] = Math.min(255, c.r * 255 * n);
    data[i * 4 + 1] = Math.min(255, c.g * 255 * n);
    data[i * 4 + 2] = Math.min(255, c.b * 255 * n);
    data[i * 4 + 3] = 255;
  }
  const map = new THREE.DataTexture(data, size, size);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestMipmapLinearFilter;
  map.generateMipmaps = true;
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ map, roughness: 1 });
  materials.set("pixel" + seed, m);
  return m;
}
function voxels() {
  const grass = pixelMaterial("#74ad4c", 1),
    dirt = pixelMaterial("#88623f", 2),
    geo = new THREE.BoxGeometry(1, 1, 1);
  geometries.add(geo);
  const terrain = new THREE.InstancedMesh(
    geo,
    [dirt, dirt, grass, dirt, dirt, dirt],
    1024,
  );
  const dummy = new THREE.Object3D();
  let n = 0;
  for (let x = -16; x < 16; x++)
    for (let z = -24; z < 8; z++) {
      let height =
        x > 6 && z < -3
          ? 0.1
          : Math.sin(x * 0.4) + Math.cos(z * 0.3) > 0.6
            ? 0.55
            : 0;
      dummy.position.set(x, height - 0.5, z);
      dummy.updateMatrix();
      terrain.setMatrixAt(n++, dummy.matrix);
    }
  terrain.receiveShadow = true;
  terrain.castShadow = true;
  world.add(terrain);
  for (const [x, z] of [
    [-5, -4],
    [6, -10],
    [-8, -14],
    [8, -20],
    [-3, -22],
  ]) {
    box(x, 1.5, z, 0.7, 3, 0.7, "#6c4d30");
    for (let y = 0; y < 2; y++)
      box(
        x,
        3 + y * 0.8,
        z,
        3 - y * 0.6,
        1,
        3 - y * 0.6,
        y ? "#529548" : "#3b7738",
      );
  }
  box(10, 0.18, -11, 7, 0.05, 15, "#4f9fb9");
  for (let i = 0; i < 6; i++)
    box(((i % 3) - 1) * 10, 12 + (i % 2) * 3, -i * 11, 6, 1.2, 2.5, "#edf5f3");
  const c = group(-2, 0, -3);
  box(0, 1.45, 0, 0.63, 0.65, 0.62, "#6d9c47", c);
  box(0, 0.7, 0, 0.43, 0.87, 0.4, "#5a813d", c);
  for (let side of [-1, 1])
    box(side * 0.25, 0.19, 0.07, 0.27, 0.38, 0.65, "#527337", c);
  box(-0.17, 1.52, 0.32, 0.13, 0.15, 0.02, "#182e23", c);
  box(0.17, 1.52, 0.32, 0.13, 0.15, 0.02, "#182e23", c);
  box(0, 1.35, 0.32, 0.16, 0.15, 0.02, "#182e23", c);
  box(0, 1.24, 0.32, 0.3, 0.1, 0.02, "#182e23", c);
}
function obby() {
  for (let i = 0; i < 15; i++) {
    const x = Math.sin(i * 0.9) * 3,
      z = 8 - i * 3.4,
      y = Math.max(0, i - 2) * 0.12;
    box(x, y - 0.3, z, 3, 0.6, 2.8, ["#a58cda", "#74c7d3", "#efbc72"][i % 3]);
    box(
      x,
      y + 0.035,
      z,
      2.8,
      0.08,
      2.6,
      ["#b49de4", "#96dbe2", "#ffcf8b"][i % 3],
    );
  }
  for (let i = 0; i < 7; i++) {
    const cloud = orb(
      (i % 2 ? 1 : -1) * (9 + i),
      -7 - (i % 3),
      -i * 9,
      4,
      "#e4e8f3",
    );
    cloud.scale.set(2, 0.3, 1);
  }
  const avatar = humanoid("roblox", -1.4, -3);
  avatar.position.y = 0.4;
  actors.hero = avatar;
  for (let side of [-1, 1]) box(side * 2.2, 2, -9, 0.3, 4, 0.3, "#e9d8a9");
  box(0, 4, -9, 4.7, 0.3, 0.3, "#e9d8a9");
  neon(0, 3.4, -8.8, 2.7, 0.35, "#a7eccb");
}
function garage() {
  box(0, -0.16, -2, 18, 0.3, 20, "#7f8178");
  box(0, 3, -9, 18, 6, 0.35, "#79867b");
  for (let side of [-1, 1]) box(side * 8.8, 3, 0, 0.3, 6, 28, "#5f706d");
  box(0, 6, 0, 18, 0.2, 28, "#859188");
  for (let x = -8; x < 9; x += 2)
    for (let z = -9; z < 10; z += 2)
      box(x, 0.002, z, 0.012, 0.012, 2, "#656c66");
  box(0, 1, -7.7, 14, 1.8, 1.5, "#69756b");
  box(0, 1.99, -7.7, 14, 0.18, 1.8, "#9e9277");
  for (let i = 0; i < 10; i++) {
    box(
      -6.3 + i * 1.4,
      1.13,
      -6.92,
      1.23,
      1.34,
      0.06,
      i % 2 ? "#899381" : "#74836f",
    );
    box(-6.3 + i * 1.4, 1.52, -6.86, 0.5, 0.07, 0.08, "#b7bead");
  }
  for (let i = 0; i < 12; i++) {
    const x = -6.2 + i * 1.1;
    cyl(
      x,
      2.2 + (i % 3) * 0.1,
      -7.7,
      0.11,
      0.18,
      0.4 + (i % 3) * 0.2,
      i % 2 ? "#b4dcbb" : "#b1c2d7",
    );
  }
  box(-4.6, 2.7, -8.55, 3, 1.15, 0.4, "#364a4a");
  neon(-4.6, 2.72, -8.32, 2.7, 0.8, "#7cbcaf");
  for (let i = 0; i < 6; i++) {
    box(
      -4.7 + (i % 3) * 0.22,
      4 - (i % 2) * 0.25,
      -8.7,
      0.08,
      0.8,
      0.08,
      "#6b7c7d",
      world,
      0.7,
    );
  }
  for (let side of [-1, 1]) {
    neon(side * 4, 5.87, -2, 3, 0.08, "#d4e8c7");
  }
  const lamp = new THREE.PointLight("#d2dacd", 24, 18, 2);
  lamp.position.set(0, 4, -5);
  scene.add(lamp);
  actors.rick = humanoid("rick", -1.7, -4.1);
  actors.morty = humanoid("morty", 0.2, -5);
  actors.garagePortal = portal(-5.8, 2.5, -8.4, "#87eb54");
  const capture = group(0, 1.7, 1);
  for (let i = 0; i < 4; i++) {
    const x = -1.1 + i * 0.73;
    box(x, 0, 0, 0.035, 2.1, 0.035, "#8cf77c", capture);
    box(0, -1.05 + i * 0.7, 0, 2.2, 0.035, 0.035, "#8cf77c", capture);
  }
  actors.cage = capture;
  actors.beam = line([-1, 1.2, -4], [0, 1.7, 1], "#92ef77", 0.026);
}
function cyber() {
  box(0, -0.2, 0, 35, 0.4, 55, "#242b45", world, 0.35);
  for (let x = -16; x < 17; x += 2)
    box(x, 0.015, -8, 0.022, 0.025, 48, "#74537d");
  for (let z = -30; z < 16; z += 2)
    box(0, 0.016, z, 34, 0.025, 0.022, "#74537d");
  for (let side of [-1, 1])
    for (let i = 0; i < 9; i++) {
      let x = side * (7 + (i % 3) * 1.8),
        h = 6 + (i % 4) * 2,
        z = 4 - i * 6;
      box(x, h / 2, z, 2, h, 2, "#242a42");
      for (let j = 0; j < 5; j++)
        neon(x, j * 1.2 + 1, z + 1.01, 0.7, 0.4, j % 2 ? "#66998e" : "#d17caf");
    }
  actors.neo = neo(-1.5, -5);
  actors.lock = group(3.4, 2, -8.8);
  for (let i = 0; i < 6; i++) {
    let rod = box(0, 0, 0.1, 2.5, 0.07, 0.07, "#e094ce", actors.lock);
    rod.rotation.z = (i * Math.PI) / 6;
  }
  const light = new THREE.PointLight("#d874bd", 22, 15, 2);
  light.position.set(0, 5, -3);
  scene.add(light);
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
  offset.x +=
    ((Math.cos(look.x) * side - Math.sin(look.x) * forward) * step * speed) /
    norm;
  offset.z +=
    ((-Math.sin(look.x) * side - Math.cos(look.x) * forward) * step * speed) /
    norm;
  const bounds = [
    [-5, 5, -6, 14],
    [-13, 13, -34, 12],
    [-14, 14, -29, 7],
    [-5, 5, -4, 4],
    [-7.5, 7.5, -11, 5],
    [-14, 14, -32, 12],
  ][stage];
  offset.x = THREE.MathUtils.clamp(offset.x, bounds[0], bounds[1]);
  offset.z = THREE.MathUtils.clamp(offset.z, bounds[2], bounds[3]);
  const baseY = stage === 2 ? 2.1 : 1.72,
    baseZ = stage === 4 ? 6.4 : stage === 0 ? 9 : 8;
  camera.position.set(offset.x, baseY, baseZ + offset.z);
  camera.rotation.set(look.y, look.x, 0, "YXZ");
  for (const actor of [actors.hero, actors.rick, actors.morty]) {
    if (actor && stage !== 0) {
      const dx = camera.position.x - actor.position.x,
        dz = camera.position.z - actor.position.z,
        dist = Math.hypot(dx, dz);
      if (dist < 0.65 && dist > 0.001) {
        camera.position.x = actor.position.x + (dx / dist) * 0.65;
        camera.position.z = actor.position.z + (dz / dist) * 0.65;
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
    actors.hero.position.y = 0.4 + Math.max(0, Math.sin(age * 2)) * 0.6;
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
  reset() {
    stage = -1;
  },
  stats() {
    return {
      stage,
      webgl: !!renderer,
      error: failure,
      objects: scene?.children[0]?.children.length,
      position: camera?.position.toArray(),
      rotation: camera?.rotation.toArray(),
    };
  },
};
