(function(root){
"use strict";
function create(THREE){
 const loader=new THREE.GLTFLoader(),cache=new Map(),base=new URL("assets/models/",document.baseURI);
 const names=new Set(["tree-meadow","cottage-lavender","rock-moss","phoenix-companion"]);
 function load(name){
   if(!names.has(name))return Promise.reject(Error("Unknown asset: "+name));
   if(!cache.has(name))cache.set(name,loader.loadAsync(new URL(name+".gltf",base).href).then(g=>{g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return g.scene}).catch(e=>{cache.delete(name);throw e}));
   return cache.get(name);
 }
 async function mount(name,target){
   try{const model=await load(name);const clone=model.clone(true);target.clear();target.add(clone);return true}
   catch(e){console.warn("Phoenix asset fallback",name,e);return false}
 }
 return {load,mount};
}
root.PhoenixAssets={create};
})(globalThis);