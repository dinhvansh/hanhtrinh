(async()=>{"use strict";
const T=window.THREE, status=document.querySelector("#status"), view=document.querySelector("#view");let renderer;
try{renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;view.append(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0xbadbe4);scene.fog=new T.Fog(0xbadbe4,35,105);
const camera=new T.PerspectiveCamera(45,1,.1,180);
const controls=new T.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=2;controls.maxDistance=70;
scene.add(new T.HemisphereLight(0xfff1d9,0x63866b,2.1));
const sun=new T.DirectionalLight(0xffe5b9,3.1);sun.position.set(-13,24,11);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:.5,far:85});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);
const fill=new T.DirectionalLight(0xb7d9ff,.6);fill.position.set(8,8,-10);scene.add(fill);
const loader=new T.GLTFLoader();const names=["tree-a","tree-b","pine","bush","flowers","fern","rock","grass","wall","door","window","roof","chimney","fence","explorer"];
let loaded=0;const entries=await Promise.all(names.map(async name=>{const g=await loader.loadAsync("models/"+name+".glb");g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});status.textContent="Đang tải model "+(++loaded)+"/"+names.length;return [name,g]}));const assets=Object.fromEntries(entries);
let seed=9281;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function h(x,z){const r=Math.hypot(x,z);const base=.14*Math.sin(x*.25)*Math.cos(z*.23)+.12*Math.cos(z*.44);const hill=2.6*Math.exp(-((x+10)**2+(z+11)**2)/62)+1.9*Math.exp(-((x-12)**2+(z+12)**2)/54);return base+hill*smooth(3,11,r)-2.8*smooth(19,25,r)}
const terrain=new T.PlaneGeometry(58,58,100,100);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position;const colors=[];const c=new T.Color();for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=h(x,z);pos.setY(i,y);const shore=smooth(18,23,Math.hypot(x,z));c.set(0x81ad64).lerp(new T.Color(0xd7c593),shore);c.multiplyScalar(.93+.08*Math.sin(x*.51+z*.35)+.035*Math.sin(z*2));colors.push(c.r,c.g,c.b)}terrain.setAttribute("color",new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const ground=new T.Mesh(terrain,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));ground.receiveShadow=true;scene.add(ground);
const water=new T.Mesh(new T.CircleGeometry(100,96),new T.MeshStandardMaterial({color:0x7fb6c7,roughness:.35,metalness:.05}));water.rotation.x=-Math.PI/2;water.position.y=-1.42;scene.add(water);
function place(name,x,z,height,rotation=0,opts={}){const template=assets[name].scene;const clone=name==="explorer"&&T.SkeletonUtils?T.SkeletonUtils.clone(template):template.clone(true);const bounds=new T.Box3().setFromObject(clone);const size=bounds.getSize(new T.Vector3());const center=bounds.getCenter(new T.Vector3());const wrapper=new T.Group();wrapper.add(clone);const s=height/Math.max(.001,size.y);clone.scale.setScalar(s);clone.position.set(-center.x*s,-bounds.min.y*s,-center.z*s);wrapper.rotation.y=rotation;wrapper.position.set(x,h(x,z),z);if(opts.y!==undefined)wrapper.position.y=opts.y;scene.add(wrapper);return {wrapper,clone,width:size.x*s,depth:size.z*s}}
const pathCurve=new T.CatmullRomCurve3([new T.Vector3(-4,0,15),new T.Vector3(-2,0,9),new T.Vector3(.3,0,4),new T.Vector3(1,0,0),new T.Vector3(-1,0,-5),new T.Vector3(-5,0,-9)]);
const pv=[],pi=[];for(let i=0;i<=100;i++){const p=pathCurve.getPoint(i/100),t=pathCurve.getTangent(i/100),w=1.04+.16*Math.sin(i*.27);for(const k of [-1,1]){let x=p.x+t.z*w*k,z=p.z-t.x*w*k;pv.push(x,h(x,z)+.035,z)}if(i<100){let n=i*2;pi.push(n,n+2,n+1,n+1,n+2,n+3)}}
const pg=new T.BufferGeometry();pg.setAttribute("position",new T.Float32BufferAttribute(pv,3));pg.setIndex(pi);pg.computeVertexNormals();const path=new T.Mesh(pg,new T.MeshStandardMaterial({color:0xd9be91,roughness:1,side:T.DoubleSide}));path.receiveShadow=true;scene.add(path);
// Actual artist-authored modular cottage; normalize imported parts.
const homeX=-5.9,homeZ=-2.4,level=h(homeX,homeZ);const wallH=2.9;
const front=place("door",homeX,homeZ+2,wallH,0,{y:level});
const back=place("window",homeX,homeZ-2,wallH,Math.PI,{y:level});
const left=place("wall",homeX-2,homeZ,wallH,Math.PI/2,{y:level});
const right=place("window",homeX+2,homeZ,wallH,-Math.PI/2,{y:level});
for(const part of [front,back,left,right]){part.clone.scale.x*=4.1/part.width}
const roof=place("roof",homeX,homeZ,2.5,0,{y:level+wallH-.1});roof.clone.scale.x*=5.2/roof.width;roof.clone.scale.z*=5.2/roof.depth;
place("chimney",homeX-1.2,homeZ-.7,1.4,0,{y:level+3.9});
for(const [x,z] of [[-9.7,1],[-8.1,1],[-6.5,1]])place("fence",x,z,.85,0);
const trees=[[-9,5,6.2,"tree-a"],[-13,0,7.5,"tree-b"],[-12,-7,8.4,"tree-a"],[-7,-12,7.3,"tree-b"],[0,-13,8.6,"tree-a"],[7,-11,7.2,"tree-b"],[12,-7,8,"tree-a"],[12,3,7.4,"tree-b"],[15,8,6.6,"tree-a"],[-13,11,6,"tree-b"],[5,-17,7.1,"pine"],[13,-13,8.4,"pine"],[-16,-11,7.2,"pine"],[-17,4,7,"pine"],[15,14,6.5,"pine"]];
for(const [x,z,ht,n] of trees)place(n,x,z,ht,rand()*6.28);
function nearPath(x,z){for(let i=0;i<=20;i++){const p=pathCurve.getPoint(i/20);if(Math.hypot(p.x-x,p.z-z)<1.45)return true}return false}
for(let i=0;i<150;i++){const x=(rand()-.5)*38,z=(rand()-.5)*38;if(Math.hypot(x,z)>18.8||nearPath(x,z)||Math.hypot(x-homeX,z-homeZ)<3.5||Math.hypot(x-2,z-4)<2.5)continue;const kind=["grass","fern","flowers","bush","rock"][Math.floor(rand()*5)];const height=kind==="bush"?.55+rand()*.65:kind==="rock"?.35+rand()*.8:kind==="grass"?.22+rand()*.2:.25+rand()*.55;place(kind,x,z,height,rand()*6.28)}
// Frame the meadow with a few deliberate foreground flower groupings.
for(const [x,z] of [[-4,6],[-3,3],[3,2],[4,5],[4.8,7],[-5,9],[-.9,12]]){place("flowers",x,z,.5,rand()*6);place("fern",x+.5,z-.3,.55,rand()*6)}
const explorer=place("explorer",.7,4.2,1.85,Math.PI*.93);const mixer=new T.AnimationMixer(explorer.clone);const idle=assets.explorer.animations.find(a=>/idle/i.test(a.name));if(idle)mixer.clipAction(idle).play();
// Previous rejected V2 mascot only as a temporary scale reference; not approved art.
const original=await loader.loadAsync("../assets/models/phoenix-companion.gltf");const mascot=original.scene;const bb=new T.Box3().setFromObject(mascot),ss=bb.getSize(new T.Vector3());mascot.scale.setScalar(1.35/ss.y);mascot.position.set(2.1,h(2.1,4)+.7,4);mascot.rotation.y=Math.PI;scene.add(mascot);mascot.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
const shots={wide:{eye:[13.4,8.2,18.8],target:[-1.5,2.1,-3]},character:{eye:[4,3.2,8.4],target:[.8,1.05,4.2]},phoenix:{eye:[3.4,2.5,7.1],target:[2.1,1.4,4]}};
function shot(name){const s=shots[name];camera.position.set(...s.eye);controls.target.set(...s.target);controls.update();document.body.dataset.shot=name}
document.querySelectorAll("[data-shot]").forEach(b=>b.onclick=()=>shot(b.dataset.shot));
function resize(){const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}window.addEventListener("resize",resize);resize();shot(new URLSearchParams(location.search).get("shot")||"wide");document.body.dataset.qa=new URLSearchParams(location.search).has("qa");
const clock=new T.Clock();renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);mixer.update(dt);controls.update();renderer.render(scene,camera)});status.textContent="15 model nguồn · cảnh thử mỹ thuật, chưa tích hợp gameplay";status.dataset.state="ready";window.artReady=true;
}catch(e){status.dataset.state="error";status.textContent=String(e);window.artError=String(e);console.error(e)}
})();