import * as THREE from "three";
import { createDiamondTrophy, trophySurfaceZ, TROPHY_PULSE_SECONDS } from "./diamondTrophy";

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({beginPath:jest.fn(),moveTo:jest.fn(),lineTo:jest.fn(),stroke:jest.fn()});
});
afterEach(() => jest.restoreAllMocks());

test("diamond facets are silver and recessed within the trophy bowl", () => {
  const medal = new THREE.Group();
  const silver = new THREE.MeshStandardMaterial({ metalness:1 });
  const { group } = createDiamondTrophy(THREE, medal, silver);
  expect(group.getObjectByName("silver-trophy-bowl")).toBeDefined();
  expect(group.getObjectByName("trophy-stem")).toBeDefined();
  const facets = group.children.filter(mesh => mesh.name === "integrated-metallic-diamond-facet");
  expect(facets).toHaveLength(8);
  facets.forEach(mesh => {
    expect(mesh.material.metalness).toBe(1);
    const vertices=mesh.geometry.attributes.position;
    for(let i=0;i<vertices.count;i++) {
      expect(vertices.getZ(i)).toBeLessThan(trophySurfaceZ(vertices.getX(i)));
    }
  });
});

test("only the recessed seams and adjacent metal pulse; disabling motion restores quiet light", () => {
  const { group, update } = createDiamondTrophy(THREE, new THREE.Group(), new THREE.MeshStandardMaterial({ metalness:1 }));
  const seam=group.getObjectByName("recessed-blue-seam").material;
  update(0,true);const quiet=seam.emissiveIntensity;
  update(TROPHY_PULSE_SECONDS/2,true);expect(seam.emissiveIntensity).toBeGreaterThan(quiet);
  update(TROPHY_PULSE_SECONDS,true);expect(seam.emissiveIntensity).toBeCloseTo(quiet);
  update(TROPHY_PULSE_SECONDS/2,false);expect(seam.emissiveIntensity).toBe(quiet);
});
