export async function buildValley(T,scene,onLoad=()=>{}){
const {MeshoptDecoder}=await import("./meshopt_decoder.module.js");await MeshoptDecoder.ready;
const loader=new T.GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);const names=["tree-a","tree-b","pine","bush","flowers","fern","rock","grass","wall","door","window","roof","chimney","fence","explorer"];
let loaded=0;const entries=await Promise.all(names.map(async name=>{const g=await loader.loadAsync(new URL("models/"+name+".glb",import.meta.url).href);g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});onLoad(++loaded,names.length);return [name,g]}));const assets=Object.fromEntries(entries);
let seed=9281;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function h(x,z){const r=Math.hypot(x,z);const base=.14*Math.sin(x*.25)*Math.cos(z*.23)+.12*Math.cos(z*.44);const hill=2.6*Math.exp(-((x+10)**2+(z+11)**2)/62)+1.9*Math.exp(-((x-12)**2+(z+12)**2)/54);const creek=1.95*Math.exp(-((z+4+.6*Math.sin(x*.6))**2)/1.15)*smooth(-4,-1,x)*(1-smooth(14,20,x));return base-creek+hill*smooth(3,11,r)-2.8*smooth(19,25,r)}
const terrain=new T.PlaneGeometry(58,58,100,100);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position;const colors=[];const c=new T.Color();for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=h(x,z);pos.setY(i,y);const shore=smooth(18,23,Math.hypot(x,z));c.set(0x81ad64).lerp(new T.Color(0xd7c593),shore);c.multiplyScalar(.93+.08*Math.sin(x*.51+z*.35)+.035*Math.sin(z*2));colors.push(c.r,c.g,c.b)}terrain.setAttribute("color",new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const ground=new T.Mesh(terrain,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));ground.receiveShadow=true;scene.add(ground);
const water=new T.Mesh(new T.CircleGeometry(100,96),new T.MeshStandardMaterial({color:0x7fb6c7,roughness:.35,metalness:.05}));water.rotation.x=-Math.PI/2;water.position.y=-1.42;scene.add(water);
const staticRoots=[];
function place(name,x,z,height,rotation=0,opts={}){const template=assets[name].scene;const clone=name==="explorer"&&T.SkeletonUtils?T.SkeletonUtils.clone(template):template.clone(true);const bounds=new T.Box3().setFromObject(clone);const size=bounds.getSize(new T.Vector3());const center=bounds.getCenter(new T.Vector3());const wrapper=new T.Group();wrapper.add(clone);const s=height/Math.max(.001,size.y);clone.scale.setScalar(s);clone.position.set(-center.x*s,-bounds.min.y*s,-center.z*s);wrapper.rotation.y=rotation;wrapper.position.set(x,h(x,z),z);if(opts.y!==undefined)wrapper.position.y=opts.y;scene.add(wrapper);if(name!=="explorer")staticRoots.push(wrapper);return {wrapper,clone,width:size.x*s,depth:size.z*s}}
const pathCurve=new T.CatmullRomCurve3([new T.Vector3(-4,0,15),new T.Vector3(-2,0,9),new T.Vector3(.3,0,4),new T.Vector3(1,0,0),new T.Vector3(-1,0,-5),new T.Vector3(-5,0,-9)]);
const pv=[],pi=[];for(let i=0;i<=100;i++){const p=pathCurve.getPoint(i/100),t=pathCurve.getTangent(i/100),w=1.04+.16*Math.sin(i*.27);for(const k of [-1,1]){let x=p.x+t.z*w*k,z=p.z-t.x*w*k;pv.push(x,h(x,z)+.035,z)}if(i<100){let n=i*2;pi.push(n,n+2,n+1,n+1,n+2,n+3)}}
const pg=new T.BufferGeometry();pg.setAttribute("position",new T.Float32BufferAttribute(pv,3));pg.setIndex(pi);pg.computeVertexNormals();const path=new T.Mesh(pg,new T.MeshStandardMaterial({color:0xd9be91,roughness:1,side:T.DoubleSide}));path.receiveShadow=true;scene.add(path);
function timber(x,y,z,w,height,depth,color){
  const beam=new T.Mesh(new T.BoxGeometry(w,height,depth),new T.MeshStandardMaterial({color,roughness:.88}));
  beam.position.set(x,y,z);
  beam.castShadow=true;beam.receiveShadow=true;scene.add(beam);
  return beam;
}
// The deck crowns above the stream and lands on both banks.
for(let i=-7;i<=7;i++){
  const z=-4+i*.32,y=.09+.28*(1-(i/7)**2);
  timber(-.4,y,z,2.4,.16,.31,i%3===0?0xc69a72:0xb28762);
}
for(const x of [-1.55,.75]){
  for(const z of [-6.2,-4,-1.8])timber(x,.52,z,.12,1.1,.12,0x866449);
  timber(x,1,-4,.1,.11,4.6,0xbb9167);
}
// Actual artist-authored modular cottage; normalize imported parts.
const homeX=-5.9,homeZ=-2.4,level=h(homeX,homeZ);const wallH=2.9;
const front=place("door",homeX,homeZ+2,wallH,0,{y:level});
const back=place("window",homeX,homeZ-2,wallH,Math.PI,{y:level});
const left=place("wall",homeX-2,homeZ,wallH,Math.PI/2,{y:level});
const right=place("window",homeX+2,homeZ,wallH,-Math.PI/2,{y:level});
for(const part of [front,back,left,right]){part.clone.scale.x*=4.1/part.width}
timber(homeX,level+1.2,homeZ,3.85,3.35,3.85,0xad7655);
timber(homeX,level+1,homeZ+1.97,1.15,2.25,.12,0x80543f);
// Light behind the round window and painted slats on the entry.
timber(homeX+1.96,level+1.52,homeZ,.08,1.65,2.1,0xffcd81);
for(const offset of [-.55,0,.55])timber(homeX+2.012,level+1.5,homeZ+offset,.05,1.6,.075,0x734d38);
for(let i=-2;i<=2;i++)timber(homeX+i*.19,level+.98,homeZ+2.05,.17,1.92,.08,0x547f75);
timber(homeX+.28,level+.96,homeZ+2.12,.09,.1,.08,0xf6be58);
const roof=place("roof",homeX,homeZ,2.5,0,{y:level+wallH-.1});roof.clone.scale.x*=5.2/roof.width;roof.clone.scale.z*=5.2/roof.depth;
place("chimney",homeX-1.2,homeZ-.7,1.4,0,{y:level+3.9});
for(const [x,z] of [[-9.7,1],[-8.1,1],[-6.5,1]])place("fence",x,z,.85,0);
const trees=[[-9,5,6.2,"tree-a"],[-13,0,7.5,"tree-b"],[-12,-7,8.4,"tree-a"],[-7,-12,7.3,"tree-b"],[0,-13,8.6,"tree-a"],[7,-11,7.2,"tree-b"],[12,-7,8,"tree-a"],[12,3,7.4,"tree-b"],[15,8,6.6,"tree-a"],[-13,11,6,"tree-b"],[5,-17,7.1,"pine"],[13,-13,8.4,"pine"],[-16,-11,7.2,"pine"],[-17,4,7,"pine"],[15,14,6.5,"pine"]];
for(const [x,z,ht,n] of trees)place(n,x,z,ht,rand()*6.28);
function nearPath(x,z){for(let i=0;i<=20;i++){const p=pathCurve.getPoint(i/20);if(Math.hypot(p.x-x,p.z-z)<1.45)return true}return false}
for(let i=0;i<150;i++){const x=(rand()-.5)*38,z=(rand()-.5)*38;if(Math.hypot(x,z)>18.8||nearPath(x,z)||Math.hypot(x-homeX,z-homeZ)<3.5||Math.hypot(x-2,z-4)<2.5)continue;const kind=["grass","fern","flowers","bush","rock"][Math.floor(rand()*5)];const height=kind==="bush"?.55+rand()*.65:kind==="rock"?.35+rand()*.8:kind==="grass"?.22+rand()*.2:.25+rand()*.55;place(kind,x,z,height,rand()*6.28)}
// Group plants along the path in drifts with breaks between beds.
for(let i=0;i<34;i++){
  const u=.08+.82*i/33, point=pathCurve.getPoint(u), tangent=pathCurve.getTangent(u);
  const side=i%2===0?1:-1, offset=side*(1.35+.45*rand());
  place(i%5===0?"fern":"flowers",point.x+tangent.z*offset,point.z-tangent.x*offset,.27+.2*rand(),rand()*6);
}
// Frame the meadow with a few deliberate foreground flower groupings.
for(const [x,z] of [[-4,6],[-3,3],[3,2],[4,5],[4.8,7],[-5,9],[-.9,12]]){place("flowers",x,z,.5,rand()*6);place("fern",x+.5,z-.3,.55,rand()*6)}
// Remove equipment before measuring the rig.
assets.explorer.scene.traverse(node=>{
  if (/knife|crossbow|throwable/i.test(node.name)) node.visible=false;
});
// Repeated imported meshes share geometry and material. Keep the skinned rig separate.
const batches=new Map();
for(const root of staticRoots){
  root.updateMatrixWorld(true);
  root.traverse(node=>{
    if(!node.isMesh)return;
    const cellX=Math.floor(node.matrixWorld.elements[12]/10),cellZ=Math.floor(node.matrixWorld.elements[14]/10);
    const key=cellX+","+cellZ+":"+node.geometry.uuid+":"+(Array.isArray(node.material)?node.material.map(m=>m.uuid).join():node.material.uuid);
    if(!batches.has(key))batches.set(key,{node,matrices:[]});
    batches.get(key).matrices.push(node.matrixWorld.clone());
  });
  scene.remove(root);
}
for(const {node,matrices} of batches.values()){
  const batch=new T.InstancedMesh(node.geometry,node.material,matrices.length);
  matrices.forEach((m,i)=>batch.setMatrixAt(i,m));
  batch.castShadow=true;batch.receiveShadow=true;scene.add(batch);
}
const explorer=place("explorer",.7,4.2,1.85,.18);const mixer=new T.AnimationMixer(explorer.clone);const idle=assets.explorer.animations.find(a=>a.name==="Unarmed_Idle");if(idle)mixer.clipAction(idle).play();
// A rolled field map tucked behind the shoulder.
const chest=explorer.clone.getObjectByName("chest");
const roll=new T.Mesh(new T.CylinderGeometry(.085,.085,.56,16),new T.MeshStandardMaterial({color:0xf6dbac}));
roll.position.set(0,.04,-.24);roll.rotation.z=1.26;chest.add(roll);
for(const y of [-.15,.15]){
  const binding=new T.Mesh(new T.CylinderGeometry(.089,.089,.045,16),new T.MeshStandardMaterial({color:0x896548}));
  binding.position.y=y;roll.add(binding);
}
// Use the identity and palette of the original companion.
const original=await loader.loadAsync(new URL("../assets/models/phoenix-companion.gltf",import.meta.url).href);const mascot=original.scene;const bb=new T.Box3().setFromObject(mascot),ss=bb.getSize(new T.Vector3());mascot.scale.setScalar(1.35/ss.y);mascot.position.set(2.1,h(2.1,4)+.7,4);mascot.rotation.y=Math.PI;scene.add(mascot);mascot.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
// A fine brass orbit and a four-point glint give the companion its own magical motif.
const orbit=new T.Mesh(new T.TorusGeometry(.205,.012,8,48),new T.MeshStandardMaterial({color:0xffcf85,metalness:.35,roughness:.42}));
orbit.position.set(0,.37,-.48);orbit.rotation.x=.9;orbit.rotation.y=-.36;mascot.add(orbit);
const glint=new T.Mesh(new T.OctahedronGeometry(.046),new T.MeshStandardMaterial({color:0xffeac3,emissive:0xf5bb65,emissiveIntensity:.4}));
glint.scale.set(.72,1.5,.6);glint.position.set(.182,.45,-.5);mascot.add(glint);
const eyeParts=mascot.children.filter(node=>/plush_(eye|iris|white)/.test(node.name)&&node.position.y>.8);
const eyeRest=eyeParts.map(node=>({y:node.position.y,scale:node.scale.y}));

function animateCompanion(time){

  mascot.rotation.z=.045*Math.sin(time*1.7);
  const openness=Math.min(1,.07+Math.abs(time%3.8-2)*11);
  eyeParts.forEach((node,i)=>{
    node.scale.y=eyeRest[i].scale*openness;
    node.position.y=.98+(eyeRest[i].y-.98)*openness;
  });
}

const clips=assets.explorer.animations;
let action=mixer.clipAction(idle);
function pose(name,dt){
  const next=mixer.clipAction(T.AnimationClip.findByName(clips,name));
  if(action!==next){action.fadeOut(.14);next.reset().fadeIn(.14).play();action=next}
  mixer.update(dt);
}
function floor(x,z){
  if(Math.abs(x+.4)<1.22 && Math.abs(z+4)<2.39)return .17+.28*(1-((z+4)/2.39)**2);
  return h(x,z);
}
return {hero:explorer.wrapper, mascot, pose, animateCompanion, floor,
  obstacles:[{x:homeX,z:homeZ,r:2.85},...trees.map(([x,z])=>({x,z,r:.5}))]};
}
