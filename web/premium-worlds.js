import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
// Art-directed procedural models. No ripped models, textures or external asset requests.
export function premiumHumanoid(type, x, z, api) {
  const { group, mesh, mat, box, cyl, line, neon } = api,
    g = group(x, 0, z);
  const palette = {
    spider: ["#a72d46", "#253d68", "#b63d50"],
    war: ["#b9afa0", "#4d3931", "#b9afa0"],
    rick: ["#dfc4af", "#665e55", "#e5e8e3"],
    morty: ["#dfb799", "#476380", "#e2be4e"],
  }[type];
  const [skin, pants, shirt] = palette;
  function ell(x, y, z, sx, sy, sz, c) {
    const m = mesh(new THREE.SphereGeometry(1, 24, 18), c, [x, y, z], g);
    m.scale.set(sx, sy, sz);
    return m;
  }
  function rounded(x, y, z, w, h, d, c, r = 0.05) {
    return mesh(new RoundedBoxGeometry(w, h, d, 3, r), c, [x, y, z], g);
  }
  function limb(a, b, r, c) {
    const delta = new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
    const m = mesh(
      new THREE.CapsuleGeometry(
        r,
        Math.max(0.01, delta.length() - r * 2),
        6,
        16,
      ),
      c,
      [0, 0, 0],
      g,
    );
    m.position.copy(
      new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(0.5),
    );
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
    return m;
  }
  // Weighted silhouette: waist, ribcage, neck and face, rather than a stack of cubes.
  ell(0, 0.94, 0, 0.29, 0.22, 0.18, pants);
  ell(0, 1.38, 0, type === "war" ? 0.4 : 0.31, 0.44, 0.19, shirt);
  cyl(0, 1.78, 0, 0.095, 0.12, 0.19, skin, g, 24);
  const head = ell(
    0,
    2.02,
    0,
    type === "rick" ? 0.19 : 0.2,
    type === "rick" ? 0.32 : 0.25,
    0.19,
    skin,
  );
  for (const side of [-1, 1]) {
    limb([side * 0.18, 0.9, 0], [side * 0.19, 0.52, 0.01], 0.115, pants);
    limb([side * 0.19, 0.52, 0.01], [side * 0.2, 0.16, 0.03], 0.095, pants);
    rounded(
      side * 0.2,
      0.1,
      0.11,
      0.24,
      0.2,
      0.43,
      type === "spider" ? "#9c2d42" : "#37343a",
      0.045,
    );
    for (let n = 0; n < 3; n++)
      rounded(
        side * 0.2,
        0.16 + n * 0.035,
        0.25,
        0.14,
        0.018,
        0.05,
        "#686168",
        0.006,
      );
    ell(side * 0.34, 1.58, 0, 0.17, 0.18, 0.19, shirt);
    limb(
      [side * 0.37, 1.56, 0],
      [side * 0.46, 1.2, 0.035],
      type === "war" ? 0.14 : 0.115,
      shirt,
    );
    limb(
      [side * 0.46, 1.2, 0.035],
      [side * 0.48, 0.9, 0.11],
      0.09,
      type === "rick" ? shirt : skin,
    );
    ell(side * 0.48, 0.85, 0.12, 0.09, 0.12, 0.065, skin);
    for (let n = 0; n < 4; n++)
      limb(
        [side * 0.43 + n * 0.029, 0.83, 0.15],
        [side * 0.43 + n * 0.029, 0.73, 0.155],
        0.016,
        skin,
      );
    if (type !== "spider")
      ell(side * 0.195, 2.02, 0, 0.045, 0.075, 0.045, skin);
  }
  const mouth = rounded(0, 1.935, 0.175, 0.1, 0.025, 0.022, "#76544d", 0.01);
  g.userData.mouth = mouth;
  g.userData.speaker = type === "rick" ? "rick" : "narrator";
  if (type === "spider") {
    for (const side of [-1, 1]) {
      const eye = ell(
        side * 0.084,
        2.055,
        0.165,
        0.076,
        0.064,
        0.018,
        "#edeae1",
      );
      eye.rotation.z = -side * 0.3;
    }
    for (let y = 1.16; y < 1.69; y += 0.1)
      line([-0.22, y, 0.175], [0.22, y, 0.175], "#442334", 0.005, g);
    for (let i = -2; i <= 2; i++)
      line([i * 0.06, 1.08, 0.18], [i * 0.09, 1.7, 0.14], "#442334", 0.005, g);
    ell(0, 1.43, 0.2, 0.035, 0.07, 0.018, "#182333");
    for (let side of [-1, 1])
      for (let j = 0; j < 4; j++)
        line(
          [0, 1.44, 0.205],
          [side * (0.08 + j * 0.02), 1.55 - j * 0.06, 0.19],
          "#182333",
          0.008,
          g,
        );
    for (let side of [-1, 1])
      rounded(side * 0.2, 0.57, 0.105, 0.19, 0.24, 0.07, "#9f3045");
  } else {
    for (const side of [-1, 1]) {
      ell(side * 0.082, 2.065, 0.163, 0.055, 0.034, 0.025, "#f2eee5");
      ell(
        side * 0.082,
        2.064,
        0.186,
        0.017,
        0.023,
        0.008,
        type === "war" ? "#6c7372" : "#282e33",
      );
      const brow = rounded(
        side * 0.081,
        2.116,
        0.176,
        0.112,
        0.025,
        0.025,
        type === "rick" ? "#88b9c6" : "#5f493d",
        0.008,
      );
      brow.rotation.z = side * (type === "war" ? 0.18 : -0.06);
    }
    ell(0, 2.015, 0.192, 0.035, 0.075, 0.065, skin);
  }
  if (type === "rick") {
    for (let i = 0; i < 17; i++) {
      let a = (i * Math.PI * 2) / 17;
      const spike = mesh(
        new THREE.ConeGeometry(0.075, 0.35, 6),
        mat("#9cbfcb"),
        [Math.cos(a) * 0.23, 2.15 + Math.sin(a) * 0.22, -0.025],
        g,
      );
      spike.rotation.z = -a + Math.PI / 2;
    }
    rounded(0, 1.33, 0.185, 0.18, 0.68, 0.035, "#80b5b0", 0.012);
    for (const side of [-1, 1]) {
      const coat = rounded(
        side * 0.16,
        1.13,
        0.1,
        0.22,
        0.94,
        0.33,
        "#e2e6df",
        0.025,
      );
      coat.rotation.z = side * -0.025;
      const lapel = rounded(
        side * 0.11,
        1.59,
        0.287,
        0.13,
        0.32,
        0.025,
        "#f2f2e9",
        0.012,
      );
      lapel.rotation.z = side * 0.28;
      rounded(side * 0.19, 1.02, 0.279, 0.12, 0.12, 0.018, "#bdc7c2", 0.008);
      for (let i = 0; i < 3; i++)
        ell(
          side * 0.065,
          1.34 - i * 0.13,
          0.285,
          0.013,
          0.013,
          0.012,
          "#707b7b",
        );
    }
    rounded(0.64, 1.05, 0.16, 0.42, 0.17, 0.21, "#768e82", 0.035);
    cyl(0.87, 1.05, 0.16, 0.08, 0.08, 0.2, "#9ac184", g, 20).rotation.z =
      Math.PI / 2;
    neon(0.94, 1.05, 0.27, 0.1, 0.075, "#9cea6e", g);
  } else if (type === "war") {
    // Beard, shaved scalp, red warpaint, leather panels and articulated axe.
    ell(0, 1.89, 0.13, 0.185, 0.16, 0.1, "#534438");
    for (let i = -3; i <= 3; i++)
      limb(
        [i * 0.04, 1.94, 0.2],
        [i * 0.035, 1.78 + Math.abs(i) * 0.015, 0.18],
        0.02,
        "#493a31",
      );
    rounded(0.07, 2.03, 0.185, 0.047, 0.41, 0.028, "#963e3d", 0.006);
    rounded(
      -0.12,
      1.44,
      0.19,
      0.055,
      0.53,
      0.025,
      "#963e3d",
      0.008,
    ).rotation.z = 0.42;
    ell(-0.32, 1.61, -0.015, 0.23, 0.2, 0.24, "#63513c");
    for (let i = 0; i < 3; i++)
      rounded(-0.32, 1.6 - i * 0.06, 0.2, 0.33, 0.035, 0.08, "#aa9670", 0.014);
    rounded(0, 0.97, 0, 0.65, 0.18, 0.43, "#554334", 0.02);
    rounded(0, 0.98, 0.24, 0.14, 0.13, 0.055, "#af976b", 0.02);
    for (let i = -2; i <= 2; i++)
      rounded(
        i * 0.11,
        0.76,
        0.23,
        0.1,
        0.34,
        0.055,
        i % 2 ? "#59483a" : "#695642",
        0.02,
      );
    cyl(0.75, 1.15, 0.05, 0.035, 0.035, 1.6, "#64503b", g, 20);
    for (let i = 0; i < 8; i++) {
      const grip = mesh(
        new THREE.TorusGeometry(0.041, 0.009, 6, 16),
        "#a39271",
        [0.75, 0.7 + i * 0.055, 0.05],
        g,
      );
      grip.rotation.x = Math.PI / 2;
    }
    const blade = rounded(
      0.96,
      1.78,
      0.05,
      0.51,
      0.49,
      0.095,
      mat("#8caab0", 0.8, 0.25),
      0.06,
    );
    blade.rotation.z = 0.22;
    for (let i = 0; i < 3; i++)
      line(
        [0.85 + i * 0.08, 1.62, 0.103],
        [0.93 + i * 0.08, 1.92, 0.103],
        "#82d5eb",
        0.009,
        g,
      );
  } else if (type === "morty") {
    const hair = ell(0, 2.19, -0.025, 0.214, 0.13, 0.2, "#624735");
    hair.rotation.x = -0.2;
  }
  return g;
}
export function enrichWorld(index, api) {
  const {
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
  } = api;
  // Tiled, rough PBR stone with fine bump detail. Cached/disposed with the world.
  function surface(base, kind) {
    const size = 128,
      data = new Uint8Array(size * size * 4),
      height = new Uint8Array(size * size * 4),
      color = new THREE.Color(base).convertLinearToSRGB();
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const i = y * size + x,
          n = (Math.sin(i * 17.13) * 4358.2) % 1,
          edge = kind === "stone" && (x % 32 < 1 || y % 32 < 1),
          k = edge ? 0.54 : 0.88 + Math.abs(n) * 0.18;
        for (let c = 0; c < 3; c++)
          data[i * 4 + c] = [color.r, color.g, color.b][c] * 255 * k;
        data[i * 4 + 3] = 255;
        for (let c = 0; c < 3; c++)
          height[i * 4 + c] = edge ? 30 : 160 + Math.abs(n) * 70;
        height[i * 4 + 3] = 255;
      }
    const texture = new THREE.DataTexture(data, size, size),
      bump = new THREE.DataTexture(height, size, size);
    for (const map of [texture, bump]) {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(18, 18);
      map.needsUpdate = true;
      map.generateMipmaps = true;
      map.minFilter = THREE.LinearMipmapLinearFilter;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: bump,
      bumpScale: 0.06,
      roughness: 0.85,
    });
    materials.set("surface-" + kind, m);
    return m;
  }
  if (index === 0) {
    box(0, -0.31, 3, 13, 0.65, 34, surface("#59636d", "stone"));
    for (let side of [-1, 1])
      for (let i = 0; i < 12; i++) {
        const z = 14 - i * 11,
          x = side * (20 + (i % 3) * 6),
          h = 14 + (i % 5) * 5;
        box(
          x,
          h / 2 - 8,
          z,
          10,
          h,
          9,
          ["#415061", "#50525e", "#394756"][i % 3],
        );
        for (let j = 0; j < 8; j++)
          neon(
            x - 3 + (j % 4) * 2,
            (j % 2) * 3 + 1,
            z + 4.53,
            0.8,
            1.3,
            "#b9c7c7",
          );
        box(x, h - 7.6, z, 11, 0.4, 10, "#67747c");
      }
    for (let i = 0; i < 7; i++) {
      let x = (i % 2 ? 1 : -1) * 5,
        z = 11 - i * 3.5;
      box(x, 0.2, z, 0.9, 0.4, 0.9, "#65747b");
      cyl(x, 1.6, z, 0.12, 0.15, 2.6, "#899299", world, 20);
      mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 20), "#6e7d87", [x, 2.4, z]);
    }
    for (let i = 0; i < 5; i++) {
      const car = group((i % 2 ? 1 : -1) * 2.2, -7.6, -12 - i * 9);
      box(
        0,
        0.32,
        0,
        1.6,
        0.58,
        3.2,
        ["#713b44", "#d2c7af", "#435b75"][i % 3],
        car,
      );
      box(0, 0.8, -0.15, 1.4, 0.5, 1.7, "#2d3f4c", car);
      for (let side of [-1, 1])
        for (let z of [-0.9, 0.9])
          cyl(
            side * 0.8,
            0.12,
            z,
            0.3,
            0.3,
            0.2,
            "#1c2630",
            car,
            16,
          ).rotation.z = Math.PI / 2;
    }
    box(-5, 1, 6, 1.5, 2, 1.2, "#5d706a");
    for (let i = 0; i < 12; i++)
      box(-5, 1.85 + i * 0.06, 6, 0.9, 0.02, 1.22, "#35474b");
  } else if (index === 1) {
    box(0, -0.21, -35, 110, 0.4, 130, surface("#c5d2d3", "snow"));
    for (let i = 0; i < 35; i++) {
      const x = (i % 2 ? 1 : -1) * (7 + (i % 6) * 2),
        z = 10 - i * 2;
      const rock = orb(x, 0.2, z, 0.7 + (i % 3) * 0.3, "#8b9c9f");
      rock.scale.set(1.6, 0.6, 1.1);
      orb(x, 0.48, z, 0.35, "#d8e2df");
    }
    for (let i = 0; i < 9; i++) {
      let x = (i % 2 ? 1 : -1) * (22 + i * 2),
        z = -24 - i * 8;
      const peak = cyl(
        x,
        10 + (i % 3) * 4,
        z,
        0,
        12,
        26 + (i % 3) * 7,
        "#728b96",
        world,
        9,
      );
      peak.rotation.y = i;
    }
    for (let side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const step = box(
          side * 5,
          0.1 + i * 0.1,
          -5 - i * 2,
          1.8,
          0.25,
          1.5,
          "#8c9c9e",
        );
        step.rotation.y = side * 0.12;
      }
      const fire = new THREE.PointLight("#e8ad71", 7, 10, 2);
      fire.position.set(side * 4, 2, -9);
      scene.add(fire);
      cyl(side * 4, 0.7, -9, 0.3, 0.4, 1.4, "#5d6464");
      orb(side * 4, 1.5, -9, 0.23, mat("#e7b47b", 0, 0.4, true));
    }
  } else if (index === 2) {
    // Expand the voxel landscape with two large, inexpensive instanced rings.
    const geo = new THREE.BoxGeometry(2, 1, 2),
      terrain = new THREE.InstancedMesh(geo, mat("#6b944e"), 1536),
      dummy = new THREE.Object3D();
    api.geometries.add(geo);
    let n = 0;
    for (let x = -32; x < 32; x++)
      for (let z = -44; z < 16; z++) {
        if (x >= -8 && x < 8 && z >= -12 && z < 4) continue;
        if (n >= 1536) break;
        dummy.position.set(
          x * 2,
          -0.8 + Math.max(0, Math.sin(x * 0.3) + Math.cos(z * 0.2)) * 0.55,
          z * 2,
        );
        dummy.updateMatrix();
        terrain.setMatrixAt(n++, dummy.matrix);
      }
    terrain.count = n;
    terrain.receiveShadow = true;
    world.add(terrain);
    for (let i = 0; i < 20; i++) {
      const x = (i % 2 ? 1 : -1) * (8 + (i % 5) * 4),
        z = -8 - i * 3;
      box(x, 1.7, z, 0.8, 3.4, 0.8, "#655133");
      for (let j = 0; j < 3; j++)
        box(
          x,
          3.5 + j * 0.6,
          z,
          3.6 - j * 0.8,
          0.9,
          3.6 - j * 0.8,
          j % 2 ? "#63924a" : "#42763d",
        );
    }
    for (let i = 0; i < 18; i++) {
      const x = ((i * 17) % 26) - 13,
        z = ((i * 13) % 30) - 22;
      box(x, 0.15, z, 0.08, 0.3, 0.08, "#466e35");
      box(x, 0.34, z, 0.3, 0.2, 0.3, i % 2 ? "#d9b766" : "#ba7d99");
    }
  } else if (index === 3) {
    for (let i = 0; i < 26; i++) {
      const x = Math.sin(i * 0.7) * 7,
        z = -20 - i * 4,
        y = 2 + i * 0.08;
      const m = mesh(
        new RoundedBoxGeometry(3, 0.6, 3, 3, 0.12),
        mat(["#967abf", "#63aebc", "#d8ae69"][i % 3]),
        [x, y, z],
      );
      for (let side of [-1, 1])
        box(x + side * 1.3, y + 0.4, z, 0.06, 0.2, 2.5, "#e2dfdc");
    }
    for (let side of [-1, 1])
      for (let i = 0; i < 6; i++) {
        const ring = mesh(
          new THREE.TorusGeometry(1.7, 0.12, 12, 40),
          mat("#a9daca", 0.3, 0.25, true),
          [side * 7, 4, -i * 12 - 10],
        );
        ring.rotation.y = side * 0.3;
      }
    box(0, -0.35, 9, 14, 0.6, 10, surface("#879bb6", "lobby"));
    for (let i = 0; i < 5; i++)
      cyl(-5 + i * 2.5, 0.35, 11, 0.4, 0.4, 0.7, "#c6a567", world, 20);
  } else if (index === 4) {
    box(0, -0.17, 0, 18, 0.32, 28, surface("#7f8a80", "stone"));
    for (let side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        let z = -6 + i * 3;
        box(side * 8.5, 1.3, z, 0.6, 2.6, 1.8, "#64776d");
        box(side * 8.15, 1.6, z, 0.03, 0.06, 0.6, "#b5c5b6");
      }
      for (let j = 0; j < 3; j++)
        line(
          [side * 7, 5.6, -8],
          [side * 7, 5.6, 12],
          j % 2 ? "#a57a5e" : "#728d88",
          0.07,
        );
    }
    for (let i = 0; i < 7; i++) {
      const z = -6 + i * 3;
      box(0, 5.75, z, 16, 0.16, 0.22, "#4b6260");
    }
    for (let i = 0; i < 6; i++) {
      let x = -5 + i * 2;
      const flask = mesh(
        new THREE.SphereGeometry(0.18, 16, 12),
        mat(i % 2 ? "#86b6bc" : "#a2c0a1", 0.2, 0.3),
        [x, 2.22, -7.3],
      );
      cyl(x, 2.46, -7.3, 0.065, 0.065, 0.22, "#b7c8ba", world, 16);
    }
    box(5, 1.25, 7, 3.8, 0.16, 2, "#a29378");
    for (let sx of [-1, 1])
      for (let sz of [-1, 1])
        box(5 + sx * 1.6, 0.6, 7 + sz * 0.7, 0.14, 1.2, 0.14, "#536963");
    const machine = group(4, 0, -5);
    box(0, 0.7, 0, 1.6, 1.4, 1.5, "#435a59", machine);
    for (let i = 0; i < 3; i++) {
      cyl(-0.45 + i * 0.45, 1.7, 0, 0.15, 0.15, 0.8, "#8aafa4", machine, 20);
      orb(
        -0.45 + i * 0.45,
        2.15,
        0,
        0.17,
        mat("#a2db9e", 0, 0.3, true),
        machine,
      );
    }
    for (let i = 0; i < 4; i++)
      neon(5 + i * 0.45, 3.6, -8.7, 0.2, 0.3, i % 2 ? "#cdb96e" : "#75baa0");
  } else {
    box(0, -0.22, -25, 70, 0.45, 110, surface("#35405c", "cyber"));
    for (let side of [-1, 1])
      for (let i = 0; i < 14; i++) {
        let x = side * (16 + (i % 4) * 3),
          z = 12 - i * 6,
          h = 9 + (i % 5) * 4;
        box(x, h / 2, z, 3, h, 3, "#29344e");
        for (let j = 0; j < 5; j++)
          neon(
            x,
            j * 1.7 + 2,
            z + 1.53,
            1.5,
            0.6,
            j % 2 ? "#95648e" : "#6caaa0",
          );
      }
    for (let side of [-1, 1])
      for (let i = 0; i < 10; i++)
        line([side * 7, 0, -i * 5], [side * 7, 4, -i * 5], "#6c7a96", 0.035);
  }
}

export function mountainMesh(x, y, z, r, h, c, parent, api) {
  const geo = new THREE.PlaneGeometry(r * 2.8, r * 2.8, 28, 28);
  geo.rotateX(-Math.PI / 2);
  const points = geo.attributes.position,
    colors = [];
  for (let i = 0; i < points.count; i++) {
    const px = points.getX(i) / r,
      pz = points.getZ(i) / r,
      rad = Math.sqrt(px * px + pz * pz);
    const noise =
      Math.sin(px * 7 + pz * 3) * 0.11 +
      Math.sin(pz * 9 - px * 4) * 0.08 +
      Math.cos(px * 13 + pz * 11) * 0.035;
    const height = Math.max(0, 1 - rad * 0.65 + noise) * h;
    points.setY(i, height - h * 0.5);
    const base = new THREE.Color(
      height > h * 0.61 ? "#d1dce0" : height > h * 0.35 ? "#91a4ad" : c,
    );
    base.multiplyScalar(0.91 + Math.sin(i * 2.4) * 0.055);
    colors.push(base.r, base.g, base.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
  });
  api.materials.set("mountain" + x + z, material);
  return api.mesh(geo, material, [x, y, z], parent);
}
