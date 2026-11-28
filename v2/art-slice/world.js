export async function buildValley(T,scene,onLoad=()=>{}){
const {MeshoptDecoder}=await import("./meshopt_decoder.module.js");
await MeshoptDecoder.ready;
const loader=new T.GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const urls=["../storybook/Millstream.glb","../storybook/Travellers.glb"];
let loaded=0;
const [landscape,actors]=await Promise.all(urls.map(async path=>{
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
const hero=actors.scene.getObjectByName("FernScout");
const mascot=actors.scene.getObjectByName("LanternPhoenix");
scene.add(hero,mascot);
hero.scale.setScalar(.9);
hero.position.set(.7,floor(.7,4.2),4.2);
hero.rotation.y=.18;
mascot.position.set(2.06,floor(2.06,4)+.63,4);
const head=hero.getObjectByName("ScoutHead");
const torso=hero.getObjectByName("ScoutTorso");
const hood=mascot.getObjectByName("PhoenixHood");
const legs=["BootPivotL","BootPivotR"].map(name=>hero.getObjectByName(name));
const arms=["SleevePivotL","SleevePivotR"].map(name=>hero.getObjectByName(name));
const wings=["WingL","WingR"].map(name=>mascot.getObjectByName(name));
function portrait(root,materialName){
  let map;
  root.traverse(node=>{
    if(!node.isMesh)return;
    node.castShadow=true;
    for(const material of [].concat(node.material)){
      if(material.name===materialName)map=material.map;
    }
  });
  return map;
}
const heroFace=portrait(hero,"Scout portrait atlas");
const phoenixFace=portrait(mascot,"Phoenix portrait atlas");
let phase=0,time=0,stride=0;
function pose(name,dt){
  time+=dt;
  const running=name==="Running_A",jump=name==="Jump_Idle";
  const moving=running||name==="Walking_A";
  stride=T.MathUtils.damp(stride,moving?(running?.80:.52):0,12,dt);
  phase+=(running?14:9)*dt;
  const step=Math.sin(phase)*stride;
  legs[0].rotation.x=jump?-.48:step;
  legs[1].rotation.x=jump?.30:-step;
  arms[0].rotation.x=jump?-.72:-step*.74;
  arms[1].rotation.x=jump?-.65:step*.74;
  const bob=.012*Math.sin(time*2.4)+.035*stride*Math.abs(Math.cos(phase));
  torso.position.y=.67+bob;
  head.position.y=1.12+bob;
  head.rotation.z=.027*Math.sin(time*1.9);
  heroFace.offset.x=time%4.3>4.15?.5:0;
}
function animateCompanion(t){
  hood.rotation.z=.06*Math.sin(t*1.65);
  for(let i=0;i<wings.length;i++)wings[i].rotation.z=(i?1:-1)*(.13+.24*Math.sin(t*3.7));
  phoenixFace.offset.x=t%3.9>3.76?.5:0;
}
return {hero,mascot,pose,animateCompanion,floor,obstacles};
}
