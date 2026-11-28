export async function buildValley(T,scene,onLoad=()=>{}){
const {MeshoptDecoder}=await import("./meshopt_decoder.module.js");
await MeshoptDecoder.ready;
const loader=new T.GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const urls=["../storybook/Millstream.glb","models/explorer.glb"];
let loaded=0;
const [landscape,explorerAsset]=await Promise.all(urls.map(async path=>{
  const model=await loader.loadAsync(new URL(path,import.meta.url).href);
  onLoad(++loaded,urls.length);
  return model;
}));
scene.add(landscape.scene);
landscape.scene.traverse(node=>{
  if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}
});
const {heights,count,width,obstacles}=landscape.scene.getObjectByName("Meadow").userData;
const bridge=landscape.scene.getObjectByName("building_bridge_B");
const ray=new T.Raycaster();
const down=new T.Vector3(0,-1,0);
landscape.scene.updateMatrixWorld(true);
const bridgeBounds=new T.Box3().setFromObject(bridge);
function floor(x,z){
  if(x>=bridgeBounds.min.x && x<=bridgeBounds.max.x && z>=bridgeBounds.min.z && z<=bridgeBounds.max.z){
    ray.ray.origin.set(x,20,z);
    ray.ray.direction.copy(down);
    const hit=ray.intersectObject(bridge,true)[0];
    if(hit)return hit.point.y;
  }
  const u=T.MathUtils.clamp((x/width+.5)*(count-1),0,count-1.001);
  const v=T.MathUtils.clamp((.5-z/width)*(count-1),0,count-1.001);
  const i=Math.floor(u),j=Math.floor(v),t=u-i,r=v-j;
  const k=j*count+i;
  return (1-r)*((1-t)*heights[k]+t*heights[k+1])+r*((1-t)*heights[k+count]+t*heights[k+count+1]);
}
const explorer={clone:explorerAsset.scene,wrapper:new T.Group()};
explorer.clone.traverse(node=>{
  if(/knife|crossbow|throwable/i.test(node.name))node.visible=false;
  if(node.isMesh)node.castShadow=true;
});
const bounds=new T.Box3().setFromObject(explorer.clone);
const scale=1.85/(bounds.max.y-bounds.min.y);
explorer.clone.scale.setScalar(scale);
explorer.clone.position.y=-bounds.min.y*scale;
explorer.wrapper.add(explorer.clone);
explorer.wrapper.position.set(.7,floor(.7,4.2),4.2);
explorer.wrapper.rotation.y=.18;
scene.add(explorer.wrapper);
const mixer=new T.AnimationMixer(explorer.clone);const idle=explorerAsset.animations.find(a=>a.name==="Unarmed_Idle");if(idle)mixer.clipAction(idle).play();
// A rolled field map tucked behind the shoulder.
const chest=explorer.clone.getObjectByName("chest");
const roll=new T.Mesh(new T.CylinderGeometry(.085,.085,.56,16),new T.MeshStandardMaterial({color:0xf6dbac}));
roll.position.set(0,.04,-.24);roll.rotation.z=1.26;chest.add(roll);
for(const y of [-.15,.15]){
  const binding=new T.Mesh(new T.CylinderGeometry(.089,.089,.045,16),new T.MeshStandardMaterial({color:0x896548}));
  binding.position.y=y;roll.add(binding);
}
// Use the identity and palette of the original companion.
const original=await loader.loadAsync(new URL("../assets/models/phoenix-companion.gltf",import.meta.url).href);const mascot=original.scene;const bb=new T.Box3().setFromObject(mascot),ss=bb.getSize(new T.Vector3());mascot.scale.setScalar(1.35/ss.y);mascot.position.set(2.1,floor(2.1,4)+.7,4);mascot.rotation.y=Math.PI;scene.add(mascot);mascot.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
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

const clips=explorerAsset.animations;
let action=mixer.clipAction(idle);
function pose(name,dt){
  const next=mixer.clipAction(T.AnimationClip.findByName(clips,name));
  if(action!==next){action.fadeOut(.14);next.reset().fadeIn(.14).play();action=next}
  mixer.update(dt);
}
return {hero:explorer.wrapper,mascot,pose,animateCompanion,floor,obstacles};
}
