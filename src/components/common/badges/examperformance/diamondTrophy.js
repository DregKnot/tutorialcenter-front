// A curved, solid silver cup with recessed metallic facets and luminous seams.
// The glow uses emissive materials, not a fullscreen bloom/postprocessing pass.
export const TROPHY_PULSE_SECONDS = 3.2;
export const trophySurfaceZ = x => 0.29 + 0.12 * Math.max(0, 1 - (x / 0.44) ** 2);

export function createDiamondTrophy(THREE, medal, silver) {
  const group = new THREE.Group(); group.name = "diamond-trophy"; medal.add(group);
  const add = (geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); group.add(mesh); return mesh;
  };
  const tube = (points, radius, material = silver) => add(new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 24, radius, 8, false
  ), material);

  // The bowl's front curves outward; its diamond-shaped cavity is cut through the cap.
  const bowl = new THREE.Shape();
  bowl.moveTo(-0.42, 0.55); bowl.lineTo(0.42, 0.55);
  bowl.bezierCurveTo(0.40, 0.18, 0.22, 0.02, 0, -0.015);
  bowl.bezierCurveTo(-0.22, 0.02, -0.40, 0.18, -0.42, 0.55);
  const A=[-0.16,0.43], B=[0,0.43], C=[0.16,0.43];
  const D=[-0.24,0.29], E=[-0.075,0.29], F=[0.075,0.29], G=[0.24,0.29], H=[0,0.075];
  const outline = [A,C,G,H,D];
  const hole = new THREE.Path();
  outline.forEach(([x,y],i)=>i ? hole.lineTo(x,y) : hole.moveTo(x,y));
  hole.closePath(); bowl.holes.push(hole);
  const body = new THREE.ExtrudeGeometry(bowl, { depth:0.07, bevelEnabled:false, curveSegments:24 });
  // Subdivide the curved cap before bending it, so the bowl stays smoothly rounded.
  const source=body.attributes.position, vertices=[], frontVertices=[];
  const subdivide=(a,b,c,level,front)=>{
    if (level) {
      const mid=(p,q)=>p.map((n,i)=>(n+q[i])/2);
      const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
      [[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]].forEach(t=>subdivide(...t,level-1,front));
    } else {
      [a,b,c].forEach(([x,y,z])=>{
        vertices.push(x,y,z>0.035?trophySurfaceZ(x):0.22);
        frontVertices.push(front);
      });
    }
  };
  for(let i=0;i<source.count;i+=3){
    const triangle=[0,1,2].map(n=>[source.getX(i+n),source.getY(i+n),source.getZ(i+n)]);
    const front=triangle.every(p=>p[2]>0.035);
    subdivide(...triangle,front?3:0,front);
  }
  const curvedBody=new THREE.BufferGeometry();
  curvedBody.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  curvedBody.computeVertexNormals();
  const normals=curvedBody.attributes.normal;
  frontVertices.forEach((front,i)=>{
    if(front){const normal=new THREE.Vector3(0.24*vertices[i*3]/(0.44**2),0,1).normalize();normals.setXYZ(i,normal.x,normal.y,normal.z);}
  });
  body.dispose();
  add(curvedBody,silver).name="silver-trophy-bowl";

  const seam = new THREE.MeshStandardMaterial({ color:0x0785ae, emissive:0x008ed6, emissiveIntensity:0.7, metalness:0.25, roughness:0.35 });
  const facetMaterial = silver.clone(); facetMaterial.emissive = new THREE.Color(0x0089bd); facetMaterial.emissiveIntensity = 0.015;
  const triangles = [[A,D,E],[A,E,B],[B,E,F],[B,F,C],[C,F,G],[D,H,E],[E,H,F],[F,H,G]];
  triangles.forEach((points,index) => {
    const center=points.reduce((sum,v)=>[sum[0]+v[0]/3,sum[1]+v[1]/3],[0,0]);
    const make = (inset, depth) => {
      const vertices=points.flatMap(([x,y])=>{
        const px=center[0]+(x-center[0])*inset, py=center[1]+(y-center[1])*inset;
        return [px,py,trophySurfaceZ(px)-depth];
      });
      const geometry=new THREE.BufferGeometry(); geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3)); geometry.computeVertexNormals(); return geometry;
    };
    add(make(1,0.031),seam).name="recessed-blue-seam";
    add(make(0.87,0.009+(index%3)*0.003),facetMaterial).name="integrated-metallic-diamond-facet";
  });

  // A small surface-local light spill softens the seams without screen-wide bloom.
  const lightMap=document.createElement("canvas"); lightMap.width=256; lightMap.height=256;
  const ctx=lightMap.getContext("2d");
  const toPixel=([x,y])=>[(x+0.3)/0.6*256,(0.485-y)/0.46*256];
  ctx.strokeStyle="#009dff"; ctx.lineWidth=1.5; ctx.shadowColor="#00bfff"; ctx.shadowBlur=10;
  const edges=new Set();
  triangles.forEach(points=>points.forEach((point,i)=>{
    const next=points[(i+1)%3],key=[point.join(","),next.join(",")].sort().join("|");
    if(edges.has(key))return; edges.add(key);
    ctx.beginPath();ctx.moveTo(...toPixel(point));ctx.lineTo(...toPixel(next));ctx.stroke();
  }));
  const spillTexture=new THREE.CanvasTexture(lightMap);
  const spillMaterial=new THREE.MeshBasicMaterial({map:spillTexture,transparent:true,opacity:0.12,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  const spillGeometry=new THREE.PlaneGeometry(0.6,0.46,16,16);
  const spillPositions=spillGeometry.attributes.position;
  for(let i=0;i<spillPositions.count;i++){
    spillPositions.setY(i,spillPositions.getY(i)+0.255);
    spillPositions.setZ(i,trophySurfaceZ(spillPositions.getX(i))+0.002);
  }
  add(spillGeometry,spillMaterial).name="diamond-seam-light-spill";

  // Curled handles and a stepped stem visually join the cup to its pedestal.
  [-1,1].forEach(side=>{
    tube([[side*.39,.49,.28],[side*.55,.49,.28],[side*.57,.32,.28],[side*.43,.14,.29],[side*.28,.12,.29]],.032);
    const mount=add(new THREE.TorusGeometry(.065,.018,8,24),silver,side*.41,.47,.32); mount.scale.y=1.18;
  });
  tube([[-.42,.55,.29],[-.23,.565,.38],[0,.57,.418],[.23,.565,.38],[.42,.55,.29]],.022);
  const stem = add(new THREE.CylinderGeometry(.045,.065,.18,24),silver,0,-.095,.29);
  stem.name="trophy-stem";
  add(new THREE.BoxGeometry(.35,.045,.16),silver,0,-.22,.29);
  add(new THREE.BoxGeometry(.43,.055,.20),silver,0,-.27,.29);

  return {
    group,
    dispose() { spillTexture.dispose(); },
    update(time, animated) {
      const pulse=animated ? (1-Math.cos(time*Math.PI*2/TROPHY_PULSE_SECONDS))/2 : 0;
      seam.emissiveIntensity=0.7+pulse*1.5;
      spillMaterial.opacity=0.12+pulse*0.65;
      facetMaterial.emissiveIntensity=0.015+pulse*0.12;
    },
  };
}
