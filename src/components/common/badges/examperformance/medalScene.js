export const FINISHES = {
  bronze: { metal: "#bc7746", enamel: "#174c3f", score: "60", name: "Bronze" },
  silver: { metal: "#cbd5e1", enamel: "#254f87", score: "70", name: "Silver" },
  gold: { metal: "#e7b94f", enamel: "#9c293e", score: "80", name: "Gold" },
  platinum: { metal: "#dae8ed", enamel: "#087e8b", score: "90", name: "Platinum" },
  diamond: { metal: "#d8edff", enamel: "#387fbb", score: "95", name: "Diamond" },
};


// Shared by the interactive medal and the checked-in image generator.
export function createMedalScene(THREE, RoomEnvironment, renderer, finish) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  camera.position.set(0, 0.12, 6.2);
  camera.lookAt(0, 0, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe9f5ff, 0x44301c, 0.65));
  const key = new THREE.DirectionalLight(0xfff0d5, 2.5);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const edge = new THREE.DirectionalLight(0xc9e7ff, 1.5);
  edge.position.set(4, -1, 2);
  scene.add(edge);
  const medal = new THREE.Group();
  scene.add(medal);
  const metal = new THREE.MeshStandardMaterial({ color: finish.metal, metalness: 1, roughness: 0.23 });
  const satin = new THREE.MeshStandardMaterial({ color: finish.metal, metalness: 0.86, roughness: 0.4 });
  const enamel = new THREE.MeshPhysicalMaterial({ color: finish.enamel, metalness: 0.2, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12 });
  const add = (geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    medal.add(mesh);
    return mesh;
  };
  const disc = (radius, depth, material, z) => {
    const mesh = add(new THREE.CylinderGeometry(radius, radius, depth, 96), material, 0, 0, z);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  const ring = (radius, tube, z, material = metal) => add(new THREE.TorusGeometry(radius, tube, 12, 96), material, 0, 0, z);
  // Solid struck-metal body and independently raised concentric rims.
  disc(1.25, 0.30, metal, -0.05);
  ring(1.22, 0.045, 0.105);
  disc(1.16, 0.026, satin, 0.115);
  ring(0.98, 0.035, 0.16);
  ring(0.92, 0.012, 0.16);
  disc(0.90, 0.025, enamel, 0.145);
  disc(0.78, 0.025, satin, 0.165);
  ring(0.79, 0.016, 0.18);
  // Machined radial fluting: actual geometry catches the studio lights.
  for (let i = 0; i < 72; i += 1) {
    const angle = i / 72 * Math.PI * 2;
    const rib = add(new THREE.BoxGeometry(0.017, 0.15, 0.035), metal, Math.sin(angle) * 1.095, Math.cos(angle) * 1.095, 0.15);
    rib.rotation.z = -angle;
  }
  // Raised victory cup, with extruded handles, stem and pedestal.
  const cup = new THREE.Shape();
  cup.moveTo(-0.34, 0.46); cup.lineTo(0.34, 0.46);
  cup.bezierCurveTo(0.32, 0.08, 0.12, 0.02, 0.055, 0.01);
  cup.lineTo(0.055, -0.13); cup.lineTo(0.22, -0.17);
  cup.lineTo(0.22, -0.23); cup.lineTo(-0.22, -0.23);
  cup.lineTo(-0.22, -0.17); cup.lineTo(-0.055, -0.13);
  cup.lineTo(-0.055, 0.01); cup.bezierCurveTo(-0.12, 0.02, -0.32, 0.08, -0.34, 0.46);
  add(new THREE.ExtrudeGeometry(cup, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.018, bevelThickness: 0.018 }), metal, 0, 0.04, 0.20);
  [-1, 1].forEach(side => {
    add(new THREE.TorusGeometry(0.15, 0.035, 12, 32), metal, side * 0.32, 0.32, 0.23);
  });
  // Printed score is backed by a raised metallic cartouche.
  const plaque = add(new THREE.BoxGeometry(0.78, 0.27, 0.045), metal, 0, -0.49, 0.20);
  const label = document.createElement("canvas"); label.width = 512; label.height = 160;
  const ctx = label.getContext("2d");
  ctx.clearRect(0, 0, 512, 160);
  ctx.fillStyle = finish.enamel; ctx.font = "bold 105px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(`${finish.score}%`, 256, 85);
  const texture = new THREE.CanvasTexture(label); texture.colorSpace = THREE.SRGBColorSpace;
  const lettering = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  add(new THREE.PlaneGeometry(0.70, 0.22), lettering, 0, -0.49, plaque.position.z + 0.025);
  // Ribbon eyelet and folded fabric sit behind the minted body.
  add(new THREE.TorusGeometry(0.14, 0.038, 12, 48), metal, 0, 1.31, -0.02);
  const ribbon = new THREE.MeshStandardMaterial({ color: finish.enamel, roughness: 0.85, metalness: 0 });
  [-1, 1].forEach(side => {
    const fold = add(new THREE.BoxGeometry(0.23, 0.5, 0.035), ribbon, side * 0.11, 1.59, -0.09);
    fold.rotation.z = side * -0.24;
  });

  medal.position.y = -0.14;
  medal.rotation.set(0.24, -0.48, -0.12);
  return { scene, camera, medal, dispose() {
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    texture.dispose(); environment.dispose();
  }};
}
