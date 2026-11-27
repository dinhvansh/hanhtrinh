// Original procedural scenery. Shared meshes keep the distant scenery to two draws.
function addPhoenixHorizon(T, scene) {
  const forms = new T.SphereGeometry(1, 22, 12);
  function group(items, color) {
    const material = new T.MeshStandardMaterial({color, roughness:1});
    const batch = new T.InstancedMesh(forms, material, items.length);
    const dummy = new T.Object3D();
    items.forEach(([x,y,z,w,h,d], i) => {
      dummy.position.set(x,y,z);
      dummy.scale.set(w,h,d);
      dummy.updateMatrix();
      batch.setMatrixAt(i,dummy.matrix);
    });
    scene.add(batch);
  }
  const hills = [], clouds = [];
  for (let i=0; i<24; i++) {
    const a=i*Math.PI/12, r=57+7*Math.sin(i*4);
    hills.push([Math.cos(a)*r,-6,Math.sin(a)*r,14,11+5*Math.cos(i*7),12]);
    if(i%3===0) {
      const x=Math.cos(a)*63,z=Math.sin(a)*63,y=14+4*Math.cos(i);
      clouds.push([x,y,z,7,1.4,3],[x+1,y+1,z,3.6,2,3],[x-3,y+.5,z,3,1.7,3]);
    }
  }
  group(hills,0x88aaa7);
  group(clouds,0xffeee1);
}
