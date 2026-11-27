(function(){
"use strict";
const $=id=>document.getElementById(id), T=window.THREE, C=window.PhoenixCore, t=(key,params)=>window.phoenixI18n.t(key,params);
let renderer;try{if(!T||!C)throw Error("Missing engine");renderer=new T.WebGLRenderer({antialias:true})}catch(e){$("fallback").hidden=false;return}
const storage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v),removeItem:k=>localStorage.removeItem(k)};
let state=C.load(storage);
const world=$("world"), canvas=renderer.domElement;
const qa=new URLSearchParams(location.search).has("qa"), touchDevice=matchMedia("(pointer: coarse)").matches, lowQuality=touchDevice||new URLSearchParams(location.search).get("quality")==="low";
const report=(key,value)=>{if(qa)world.dataset[key]=String(value)};
world.append(canvas); renderer.setPixelRatio(Math.min(devicePixelRatio||1,lowQuality?1:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
renderer.shadowMap.enabled=!lowQuality;renderer.shadowMap.type=T.PCFShadowMap;
const scene=new T.Scene();scene.background=new T.Color(0xbfe4f4);scene.fog=new T.Fog(0xbfe4f4,55,105);
const camera=new T.PerspectiveCamera(54,1,.1,160);
scene.add(new T.HemisphereLight(0xe1f3ff,0x8c7454,2));
const sun=new T.DirectionalLight(0xfff0d1,2.7);sun.position.set(-15,25,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:70});sun.shadow.normalBias=.035;scene.add(sun);
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.85,...extra});
const M={grass:mat(0x86ba6c),soil:mat(0xc59b6b),sand:mat(0xf3d5a0),water:mat(0x54b5d1,{roughness:.3}),wood:mat(0x9c6d49),leaf:mat(0x4e9c70),leaf2:mat(0xa1c773),roof:mat(0x8064ad),wall:mat(0xffe5b6),cream:mat(0xfff2d9),purple:mat(0x8c64cc),dark:mat(0x44384d),skin:mat(0xffcaa4),light:mat(0xd7c0ff,{emissive:0x9664ff,emissiveIntensity:1.1}),stone:mat(0xa7a7bd)};
function mesh(parent,geo,material,x=0,y=0,z=0,shadow=true){const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o}
const sphere=(p,r,m,x,y,z,s=14)=>mesh(p,new T.SphereGeometry(r,s,10),m,x,y,z);
const box=(p,w,h,d,m,x,y,z)=>mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z);
const cyl=(p,r1,r2,h,m,x,y,z,n=16)=>mesh(p,new T.CylinderGeometry(r1,r2,h,n),m,x,y,z);
// Lightweight original procedural textures: no external downloads.
function terrainTexture(base,colors,seedValue){const c=document.createElement("canvas");c.width=c.height=128;const ctx=c.getContext("2d");ctx.fillStyle=base;ctx.fillRect(0,0,128,128);let v=seedValue;const random=()=>((v=(v*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<1700;i++){ctx.fillStyle=colors[i%colors.length];ctx.globalAlpha=.13+random()*.17;ctx.fillRect(random()*128,random()*128,1+random()*3,1+random()*2)}const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(16,16);return tex}
M.grass.map=terrainTexture("#ffffff",["#93a56d","#d4e4a0","#a5c98d"],25);M.grass.needsUpdate=true;
const land=new T.Group();scene.add(land);
cyl(land,22,20,2,M.soil,0,-1.65,0,64);cyl(land,22,22,.65,M.grass,0,-.325,0,64);
const ocean=mesh(scene,new T.CircleGeometry(100,80),M.water,0,-2.7,0,false);ocean.rotation.x=-Math.PI/2;
const path=box(land,2.5,.035,30,M.sand,0,.02,0);path.castShadow=false;
const cross=box(land,24,.035,2.2,M.sand,0,.022,4);cross.castShadow=false;
const modelTargets=[];const obstacles=[];function block(x,z,r){obstacles.push({x,z,r})}
function tree(x,z,s=1){let g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(s);land.add(g);cyl(g,.18,.3,1.65,M.wood,0,.82,0,8);for(const [dx,dy,dz,r] of [[0,2,0,.95],[-.6,1.55,.12,.65],[.55,1.7,-.15,.7]])sphere(g,r,dx===0?M.leaf2:M.leaf,dx,dy,dz,10);block(x,z,.47*s);modelTargets.push(["tree-meadow",g])}
[[-7,9,1.15],[8,10,1.1],[-13,4,1],[13,3,1.1],[-12,-10,1.3],[12,-11,1.15],[-5,-17,1],[6,-17,1],[-17,-2,1],[17,0,1],[-10,15,.85],[9,16,.9]].forEach(a=>tree(...a));
function cottage(x,z){const g=new T.Group();g.position.set(x,0,z);land.add(g);box(g,4,2.8,3.6,M.wall,0,1.4,0);const roof=mesh(g,new T.ConeGeometry(3.15,1.8,4),M.roof,0,3.45,0);roof.rotation.y=Math.PI/4;box(g,.9,1.6,.12,M.wood,0,.8,1.86);for(const dx of [-1.3,1.3])box(g,.65,.7,.12,M.light,dx,1.65,1.86);box(g,.55,1.5,.55,M.stone,1.3,3.65,-.55);block(x,z,2.75);modelTargets.push(["cottage-lavender",g])}
cottage(-7,3);cottage(7,3);
const pond=mesh(land,new T.CircleGeometry(2.7,40),M.water,8,.035,-8,false);pond.rotation.x=-Math.PI/2;block(8,-8,2.5);
let seed=29;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const flowerMats=[mat(0xffb2bd),mat(0xffd569),mat(0xbca0ee)];for(let i=0;i<80;i++){let x=(rand()-.5)*40,z=(rand()-.5)*40;if(Math.hypot(x,z)>20||Math.abs(x)<2||Math.abs(z-4)<2||obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.5))continue;const f=sphere(land,.11,flowerMats[i%3],x,.15,z,6);f.castShadow=false}
// Decorative grass patches, small stepping stones and clouds, kept independent of collision.
const tuftGeometry=new T.ConeGeometry(.12,.42,3);const tuftMat=mat(0x5f9852);const tufts=new T.InstancedMesh(tuftGeometry,tuftMat,360);const dummy=new T.Object3D();let count=0;
for(let i=0;i<580&&count<360;i++){const x=(rand()-.5)*40,z=(rand()-.5)*40;if(Math.hypot(x,z)>20||Math.abs(x)<2||Math.abs(z-4)<2||obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.7))continue;dummy.position.set(x,.12,z);dummy.scale.set(.7+rand()*.7,.5+rand()*.7,.7+rand()*.7);dummy.rotation.set((rand()-.5)*.55,rand()*6.28,(rand()-.5)*.55);dummy.updateMatrix();tufts.setMatrixAt(count++,dummy.matrix)}tufts.count=count;tufts.instanceMatrix.needsUpdate=true;land.add(tufts);
const stepping=mat(0xe8d7b8);for(let z=-7.7;z<13;z+=2.3){const stone=mesh(land,new T.BoxGeometry(1.7,.035,.8),stepping,(rand()-.5)*.3,.047,z,false);stone.rotation.y=(rand()-.5)*.12}
const cloudMat=mat(0xffffff,{roughness:1});const clouds=[];for(const [x,y,z] of [[-25,13,-24],[15,16,-30],[30,12,0],[-27,15,13]]){const g=new T.Group();for(const [a,b,c,r] of [[0,0,0,2.1],[-1.8,-.2,0,1.5],[1.7,-.15,.2,1.6],[.4,.6,0,1.6]]){const puff=sphere(g,r,cloudMat,a,b,c,10);puff.castShadow=false;puff.scale.y=.6}g.position.set(x,y,z);scene.add(g);clouds.push({g,x})}
const station={x:0,z:-10};cyl(land,1.55,1.7,.3,M.stone,station.x,.15,station.z,12);const crystal=mesh(land,new T.OctahedronGeometry(.9),M.light,station.x,1.6,station.z);const beacon=mesh(land,new T.TorusGeometry(1.38,.055,8,40),M.light,station.x,.35,station.z,false);beacon.rotation.x=Math.PI/2;
const marker=new T.Group();land.add(marker);const diamond=mesh(marker,new T.OctahedronGeometry(.24),mat(0xffd65f,{emissive:0xffb22f,emissiveIntensity:.8}));marker.position.set(station.x,3.4,station.z);
function playerModel(){
const p=new T.Group(),body=new T.Group();p.add(body);
const capsule=(g,r,len,m,x,y,z)=>mesh(g,new T.CapsuleGeometry(r,len,4,10),m,x,y,z);
const shirt=mat(0x876bc6),collar=mat(0xf7e7c9),leather=mat(0x99683f),boots=mat(0x54445a),hair=mat(0x493846);
const torso=capsule(body,.31,.38,shirt,0,1.02,0);torso.scale.set(1.08,1,.76);
const scarf=mesh(body,new T.TorusGeometry(.22,.064,8,20),collar,0,1.35,0);scarf.rotation.x=Math.PI/2;
const head=new T.Group();head.position.set(0,1.65,0);body.add(head);
const face=sphere(head,.34,M.skin,0,0,-.035,18);face.scale.set(1,1.04,.94);
const cap=mesh(head,new T.SphereGeometry(.355,18,12,0,Math.PI*2,0,Math.PI*.56),hair,0,.055,.04);cap.scale.z=.98;
const tuft=sphere(head,.19,hair,.13,.19,-.12,12);tuft.scale.set(1,.65,.85);
for(const x of [-.32,.32])sphere(head,.087,M.skin,x,-.035,-.015,10);
for(const x of [-.12,.12]){sphere(head,.038,M.dark,x,.025,-.34,8);sphere(head,.014,M.cream,x-.008,.035,-.371,6)}
const pack=capsule(body,.24,.25,leather,0,1.02,.27);pack.scale.set(1.2,1,.67);const flap=box(body,.47,.19,.13,M.wood,0,1.22,.4);box(body,.105,.12,.06,collar,0,1.13,.49);
for(const x of [-.2,.2]){box(body,.075,.62,.065,leather,x,1.04,-.235)}
const legs=[],arms=[];
for(const x of [-.17,.17]){const leg=new T.Group();leg.position.set(x,.67,0);p.add(leg);capsule(leg,.112,.32,boots,0,-.23,0);const boot=capsule(leg,.13,.14,leather,0,-.49,-.06);boot.rotation.x=Math.PI/2;boot.scale.y=1.05;legs.push(leg)}
for(const x of [-.36,.36]){const arm=new T.Group();arm.position.set(x,1.27,0);p.add(arm);capsule(arm,.115,.23,collar,0,-.18,0);sphere(arm,.115,M.skin,0,-.4,0,10);arms.push(arm)}
return {p,body,head,legs,arms};
}
const avatar=playerModel(),player=avatar.p;scene.add(player);player.position.set(0,0,10);
const phoenix=new T.Group();scene.add(phoenix);sphere(phoenix,.48,M.cream,0,.48,0);const hood=sphere(phoenix,.49,M.cream,0,.68,.04);hood.scale.set(1,1.12,.94);for(const x of [-.27,.27]){let ear=mesh(phoenix,new T.ConeGeometry(.14,.34,9),M.cream,x,1.07,0);ear.rotation.z=-x}for(const x of [-.15,.15])sphere(phoenix,.049,M.dark,x,.73,-.43,8);sphere(phoenix,.18,M.light,0,.35,-.43);phoenix.position.set(1.4,1,8.5);modelTargets.push(["phoenix-companion",phoenix]);
for(const [x,z,s] of [[-11,12,.85],[12,13,.9],[-9,-9,.9],[11,-14,.7]]){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(s);land.add(g);sphere(g,.45,M.stone,0,.3,0,7);block(x,z,.7*s);modelTargets.push(["rock-moss",g])}
if(window.PhoenixAssets&&T.GLTFLoader){const assets=window.PhoenixAssets.create(T);Promise.all(modelTargets.map(([name,g])=>assets.mount(name,g))).then(results=>{const count=results.filter(Boolean).length;report("assets",count+"/"+results.length);console.info("Phoenix assets loaded",count+"/"+results.length)});}else report("assets","fallback");
let guide=false,yaw=0,pitch=.43,vy=0,grounded=true,step=0,lit=false,quizIndex=0,waiting=false,modal=false,saveFailed=false;const keys=new Set();
function refresh(){const done=C.stars(state);$("stars").textContent=done;$("objective").textContent=done?t("done"):t("objective");$("hint").textContent=done?t("hintDone"):guide?t("hintGuide"):t("hint");if(saveFailed)$("hint").textContent+=" · "+t("saveError");$("guide").textContent=guide?t("stopGuide"):t("guide")}
function persist(){saveFailed=!C.save(storage,state);refresh()}
function isModal(){return $("welcome").open||$("lesson").open}
function clearInput(){keys.clear();drag=null}
function showWelcome(){$("name").value=state.name;clearInput();$("welcome").showModal()}
for(const id of ["welcome","lesson"]){$(id).addEventListener("close",()=>{clearInput();canvas.focus({preventScroll:true})})}canvas.tabIndex=0;
$("nameform").addEventListener("submit",e=>{e.preventDefault();state.name=$("name").value.trim().slice(0,24)||t("defaultName");persist();$("welcome").close()});
$("profile").onclick=showWelcome;$("reset").onclick=()=>{if(confirm(t("resetConfirm"))){C.reset(storage);state=C.fresh();persist();player.position.set(0,0,10);vy=0;grounded=true;guide=false;refresh();showWelcome()}};
$("guide").onclick=e=>{guide=!guide;refresh();if(e.detail>0)canvas.focus({preventScroll:true})};
function jump(){if(!isModal()&&grounded){vy=5.6;grounded=false}}
$("jump").onclick=jump;
const distance=()=>Math.hypot(player.position.x-station.x,player.position.z-station.z);
function interact(){if(isModal())return;if(distance()>3){$("near").textContent=t("far");return}clearInput();guide=false;refresh();quizIndex=0;lit=false;waiting=false;$("experiment").hidden=false;$("rays").setAttribute("opacity","0");$("light").disabled=false;$("answers").replaceChildren();$("feedback").textContent="";$("lessonTitle").textContent=t("lessonTitle");$("lessonText").textContent=t("lessonIntro");$("lesson").showModal()}
$("interact").onclick=interact;$("close").onclick=()=>$("lesson").close();
const spectrum=$("spectrum");["#fd6a65","#ffa74f","#ffe46d","#8dde7b","#6ed9f5","#748ef9","#c487f4"].forEach((color,i)=>{const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d","M148 101 L"+(42+i*12)+" 132");p.setAttribute("stroke",color);p.setAttribute("stroke-width","3");p.setAttribute("fill","none");spectrum.append(p)});
function showQuestion(){const item=C.quiz[quizIndex],q={q:t(item.q),options:item.options.map(key=>t(key)),answer:item.answer,explain:t(item.explain)};$("lessonText").textContent=q.q;$("answers").replaceChildren();$("feedback").textContent="";q.options.forEach((o,i)=>{let b=document.createElement("button");b.textContent=o;b.onclick=()=>{if(waiting)return;if(i!==q.answer){$("feedback").textContent=t("retry")+" "+q.explain;return}waiting=true;$("feedback").textContent=t("correct")+" "+q.explain;[...$("answers").children].forEach(x=>x.disabled=true);let next=document.createElement("button");next.textContent=quizIndex+1<C.quiz.length?t("next"):t("claim");next.onclick=()=>{waiting=false;if(++quizIndex<C.quiz.length)showQuestion();else finish()};$("answers").append(next)};$("answers").append(b)})}
$("light").onclick=()=>{if(lit)return;lit=true;$("rays").setAttribute("opacity","1");$("light").disabled=true;$("lessonText").textContent=t("lessonLit");$("answers").replaceChildren();let b=document.createElement("button");b.textContent=t("challenge");b.onclick=()=>{$("experiment").hidden=true;showQuestion()};$("answers").append(b)};
function finish(){const fresh=C.complete(state);persist();$("experiment").hidden=true;$("lessonTitle").textContent=t("badge");$("lessonText").textContent=fresh?t("earned",{name:state.name}):t("already");$("feedback").textContent="";$("answers").replaceChildren();let b=document.createElement("button");b.textContent=t("back");b.onclick=()=>$("lesson").close();$("answers").append(b)}
const moveKeys=new Set(["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","e"]);
addEventListener("keydown",e=>{if(isModal()||["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(!moveKeys.has(k)||(k===" "&&e.target.tagName==="BUTTON"))return;e.preventDefault();if(k===" "){if(!e.repeat)jump()}else if(k==="e"){if(!e.repeat)interact()}else keys.add(k)});
addEventListener("keyup",e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));addEventListener("blur",clearInput);document.addEventListener("visibilitychange",()=>{if(document.hidden)clearInput()});
let drag=null;canvas.addEventListener("pointerdown",e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener("pointermove",e=>{if(!drag||drag.id!==e.pointerId)return;yaw-=(e.clientX-drag.x)*.006;pitch=Math.max(.18,Math.min(.85,pitch+(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY});for(const event of ["pointerup","pointercancel","lostpointercapture"])canvas.addEventListener(event,e=>{if(drag?.id===e.pointerId)drag=null});
document.querySelectorAll("[data-key]").forEach(b=>{const k=b.dataset.key;b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(!isModal())keys.add(k)});for(const ev of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(ev,()=>keys.delete(k))});
function allowed(x,z){return Math.hypot(x,z)<20.9&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.3)}
function guideTarget(x,z){const dx=station.x-x,dz=station.z-z,d=Math.hypot(dx,dz);if(d<2.2)return [station.x+1.4,station.z+1];const len=Math.min(3,d);const angles=[0,.45,-.45,.9,-.9,1.5,-1.5,2.2,-2.2];const theta=Math.atan2(dz,dx);for(const angle of angles){const a=theta+angle,tx=x+Math.cos(a)*len,tz=z+Math.sin(a)*len;if(allowed(tx,tz)&&[.25,.5,.75].every(f=>allowed(x+(tx-x)*f,z+(tz-z)*f)))return [tx,tz]}return [x,z]}
const camOffset=new T.Vector3(),look=new T.Vector3(),target=new T.Vector3();function resize(){const w=world.clientWidth,h=world.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}addEventListener("resize",resize);resize();
let last=performance.now(),time=0,nearPrev=null;function tick(now){const dt=Math.min(.045,(now-last)/1000);last=now;time+=dt;requestAnimationFrame(tick);
let ix=0,iz=0;if(!isModal()){ix=(keys.has("d")||keys.has("ArrowRight")?1:0)-(keys.has("a")||keys.has("ArrowLeft")?1:0);iz=(keys.has("s")||keys.has("ArrowDown")?1:0)-(keys.has("w")||keys.has("ArrowUp")?1:0)}
const moving=ix!==0||iz!==0;if(moving){const n=Math.hypot(ix,iz);ix/=n;iz/=n;const dx=(ix*Math.cos(yaw)+iz*Math.sin(yaw))*dt*5,dz=(-ix*Math.sin(yaw)+iz*Math.cos(yaw))*dt*5;if(allowed(player.position.x+dx,player.position.z))player.position.x+=dx;if(allowed(player.position.x,player.position.z+dz))player.position.z+=dz;player.rotation.y=Math.atan2(-dx,-dz);step+=dt*12}
if(!grounded&&!isModal()){vy-=dt*14;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;grounded=true}}
const swing=moving&&grounded?Math.sin(step)*.62:0;const ease=1-Math.exp(-dt*12);
const poses=grounded?[swing,-swing,-swing*.8,swing*.8]:[-.42,.29,-.65,-.65];
[...avatar.legs,...avatar.arms].forEach((limb,i)=>{limb.rotation.x+=(poses[i]-limb.rotation.x)*ease});avatar.body.position.y=grounded?(moving?Math.abs(Math.sin(step))*.042:Math.sin(time*2)*.012):.025;
avatar.head.rotation.z=moving?Math.sin(step)*.035:Math.sin(time*1.6)*.025;avatar.body.rotation.x+=( (moving?.075:0)-avatar.body.rotation.x)*ease;
clouds.forEach(({g,x},i)=>g.position.x=x+Math.sin(time*.09+i)*1.8);
if(guide){const [x,z]=guideTarget(player.position.x,player.position.z);target.set(x,1.3+Math.sin(time*4)*.12,z)}else target.set(player.position.x+1.35,player.position.y+1.15+Math.sin(time*4)*.12,player.position.z-1.3);
if(!isModal())phoenix.position.lerp(target,1-Math.exp(-dt*3.7));phoenix.lookAt(player.position.x,phoenix.position.y,player.position.z);phoenix.rotateY(Math.PI);
crystal.rotation.y+=dt*.65;crystal.position.y=1.5+Math.sin(time*2)*.13;marker.position.y=3.3+Math.sin(time*3)*.19;diamond.rotation.y+=dt;
const near=distance()<=3;if(near!==nearPrev){nearPrev=near;$("near").textContent=near?t("near"):t(touchDevice?"touchControls":"controls")}
const range=touchDevice?10.5:8.6;camOffset.set(Math.sin(yaw)*Math.cos(pitch)*range,Math.sin(pitch)*range,Math.cos(yaw)*Math.cos(pitch)*range);look.copy(player.position).add(new T.Vector3(0,1.15,0));// Conservative camera shortening near solid obstacles (not a full physics raycast).
let cameraFactor=1;for(let f=.18;f<=1;f+=.08){const cx=look.x+camOffset.x*f,cz=look.z+camOffset.z*f,cy=look.y+camOffset.y*f;if(cy<4.8&&obstacles.some(o=>Math.hypot(cx-o.x,cz-o.z)<o.r+.15)){cameraFactor=Math.max(.2,f-.1);break}}
camera.position.copy(look).addScaledVector(camOffset,cameraFactor);camera.lookAt(look);renderer.render(scene,camera);if(qa){report("ready","true");report("x",player.position.x.toFixed(2));report("y",player.position.y.toFixed(2));report("z",player.position.z.toFixed(2));report("yaw",yaw.toFixed(2));report("near",near);report("guide",guide)}}
document.addEventListener("phoenix:locale",()=>{refresh();nearPrev=null;if(!isModal())canvas.focus({preventScroll:true})});
refresh();if(!state.name)showWelcome();requestAnimationFrame(tick);
})();