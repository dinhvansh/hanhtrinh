(async()=>{"use strict";
const T=window.THREE, status=document.querySelector("#status"), view=document.querySelector("#view");let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:new URLSearchParams(location.search).has("qa")});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;view.append(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0xd4e1df);scene.fog=new T.Fog(0xd4e1df,21,77);

const camera=new T.PerspectiveCamera(45,1,.1,180);
const controls=new T.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=2;controls.maxDistance=70;
scene.add(new T.HemisphereLight(0xffedd8,0x718a99,1.55));
const sun=new T.DirectionalLight(0xffe0b9,2.4);sun.position.set(-13,24,11);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:.5,far:85});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);
const fill=new T.DirectionalLight(0xb7d9ff,.6);fill.position.set(8,8,-10);scene.add(fill);
const {buildValley}=await import("./world.js");
const valley=await buildValley(T,scene,(n,total)=>status.textContent="Đang tải "+n+"/"+total);
const hoverHeight=valley.mascot.position.y;
const shots={mobile:{eye:[1.4,2.4,10.2],target:[1.25,1.18,4]},wide:{eye:[6.4,6.6,19.5],target:[-1,2.85,-3]},gameplay:{eye:[1,3.3,10.8],target:[0,1.3,1]},character:{eye:[1.6,1.65,7.15],target:[.8,1.05,4.2]},phoenix:{eye:[1.66,1.64,5.79],target:[2.1,1.4,4]}};
function shot(name){const s=shots[name];camera.fov=name==="wide"?41.1:45;camera.updateProjectionMatrix();camera.position.set(...s.eye);controls.target.set(...s.target);controls.update();document.body.dataset.shot=name}
document.querySelectorAll("[data-shot]").forEach(b=>b.onclick=()=>shot(b.dataset.shot));
function resize(){const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}window.addEventListener("resize",resize);resize();shot(new URLSearchParams(location.search).get("shot")||"wide");document.body.dataset.qa=new URLSearchParams(location.search).has("qa");
const clock=new T.Clock();if(document.body.dataset.qa==="true"){valley.pose("Unarmed_Idle",0);controls.update();renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);renderer.getContext().finish();window.artStats={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}else{renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);valley.pose("Unarmed_Idle",dt);valley.animateCompanion(clock.elapsedTime);valley.mascot.position.y=hoverHeight+.065*Math.sin(clock.elapsedTime*2.5);controls.update();renderer.render(scene,camera)});}status.textContent="Kéo để xoay · Cuộn để thu phóng";status.dataset.state="ready";window.artReady=true;
}catch(e){status.dataset.state="error";status.textContent=String(e);window.artError=String(e);console.error(e)}
})();