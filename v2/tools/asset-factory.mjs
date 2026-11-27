/* Phoenix Asset Factory — original procedural assets, no external art.
   Node: node v2/tools/asset-factory.mjs [output-directory]
   Exports both glTF (embedded buffers) and GLB. */
function buildAssets(){
const PI=Math.PI;
const shapes={};
function geom(name,triangles,smooth=false){
  const p=[],n=[];
  for(let [a,b,c] of triangles){
    let u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]);
    let norm=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(norm.reduce((s,x,i)=>s+x*(a[i]+b[i]+c[i]),0)<0){[b,c]=[c,b];norm=norm.map(x=>-x)}
    const len=Math.hypot(...norm);if(len<1e-8)continue;
    for(const q of [a,b,c]){p.push(...q);const nn=smooth?q:norm;const l=Math.hypot(...nn);n.push(...nn.map(x=>x/l))}
  }
  shapes[name]={p,n};
}
const cube=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];
const faces=[[0,1,2,3],[4,5,6,7],[0,4,7,3],[1,5,6,2],[0,1,5,4],[3,2,6,7]];
geom("box",faces.flatMap(([a,b,c,d])=>[[cube[a],cube[b],cube[c]],[cube[a],cube[c],cube[d]]]));
const wedge=[[-.5,-.4,-.5],[.5,-.4,-.5],[0,.6,-.5],[-.5,-.4,.5],[.5,-.4,.5],[0,.6,.5]];
geom("roof",[[0,1,2],[3,4,5],[0,1,4],[0,4,3],[0,2,5],[0,5,3],[1,2,5],[1,5,4]].map(t=>t.map(i=>wedge[i])));
function round(name,top,bottom,segments){
  const tris=[];
  for(let i=0;i<segments;i++){const a=i*2*PI/segments,b=(i+1)*2*PI/segments;
    const p=[bottom*Math.cos(a),-.5,bottom*Math.sin(a)],q=[bottom*Math.cos(b),-.5,bottom*Math.sin(b)],r=[top*Math.cos(a),.5,top*Math.sin(a)],s=[top*Math.cos(b),.5,top*Math.sin(b)];
    tris.push([p,q,r],[q,s,r],[[0,-.5,0],q,p],[[0,.5,0],r,s]);}
  geom(name,tris)
}
round("trunk",.35,.5,10);round("cylinder",.5,.5,12);round("cone",0,.5,10);
function ball(name,rows,cols,smooth){const tri=[];const pt=(i,j)=>{let a=i*PI/rows,b=j*2*PI/cols;return [.5*Math.sin(a)*Math.cos(b),.5*Math.cos(a),.5*Math.sin(a)*Math.sin(b)]};for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){let a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),d=pt(i,j+1);tri.push([a,b,c],[a,c,d])}geom(name,tri,smooth)}
ball("foliage",5,9,false);ball("smooth",10,16,true);ball("plush",16,24,true);
const palette={bark:"#906143",barkLight:"#b38458",leaf:"#65a56b",leafDark:"#408a66",leafLight:"#a2c878",leafGold:"#d1cf77",cream:"#fff0d6",face:"#fff8ed",hood:"#f2dec2",earPink:"#efb3ba",iris:"#80543f",nose:"#da9a88",wall:"#f4d6a7",trim:"#ad8058",roof:"#8063af",roofLight:"#a48bcf",roofDark:"#665091",glass:"#9be2e7",stone:"#a39a9a",stoneLight:"#c5bdad",flower:"#f3a0ad",stem:"#4b9365",yellow:"#ffd46c",purple:"#9872d9",purpleDark:"#65489e",eye:"#453548",blush:"#f5b6b0",orb:"#b99cff",white:"#fffaf1"};
const lin=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4;
const color=h=>[1,3,5].map(i=>lin(parseInt(h.slice(i,i+2),16)/255));
const B64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function encode(bytes){let out="";for(let i=0;i<bytes.length;i+=3){let v=(bytes[i]<<16)|((bytes[i+1]||0)<<8)|(bytes[i+2]||0);out+=B64[v>>18]+B64[(v>>12)&63]+(i+1<bytes.length?B64[(v>>6)&63]:"=")+(i+2<bytes.length?B64[v&63]:"=")}return out}
function asset(name,design){
 const nodes=[],meshes=[],materials=[],accessors=[],bufferViews=[],chunks=[],gcache={},mcache={},meshcache={};let size=0;
 function data(values,bounds){let f=new Float32Array(values),b=new Uint8Array(f.buffer),view=bufferViews.length;bufferViews.push({buffer:0,byteOffset:size,byteLength:b.length,target:34962});chunks.push(b);size+=b.length;let a={bufferView:view,componentType:5126,count:values.length/3,type:"VEC3"};if(bounds){a.min=[0,1,2].map(k=>Math.min(...values.filter((_,i)=>i%3===k)));a.max=[0,1,2].map(k=>Math.max(...values.filter((_,i)=>i%3===k)))}accessors.push(a);return accessors.length-1}
 function part(shape,material,t,s,rotation=0,roll=0){
  if(!gcache[shape]){let g=shapes[shape];gcache[shape]={POSITION:data(g.p,true),NORMAL:data(g.n,false)}}
  if(mcache[material]===undefined){const rgb=color(palette[material]);let m={name:material,pbrMetallicRoughness:{baseColorFactor:[...rgb,1],metallicFactor:0,roughnessFactor:.86}};if(material==="orb"||material==="glass"){m.emissiveFactor=rgb.map(v=>v*.35)}mcache[material]=materials.length;materials.push(m)}
  const key=shape+":"+material;if(meshcache[key]===undefined){meshcache[key]=meshes.length;meshes.push({name:key,primitives:[{attributes:gcache[shape],material:mcache[material]}]})}
  const cy=Math.cos(rotation/2),sy=Math.sin(rotation/2),cz=Math.cos(roll/2),sz=Math.sin(roll/2);
  nodes.push({name:shape+"_"+material,mesh:meshcache[key],translation:t,scale:s,rotation:[sy*sz,sy*cz,cy*sz,cy*cz]});
 }
 design(part);
 const bytes=new Uint8Array(size);let off=0;for(const c of chunks){bytes.set(c,off);off+=c.length}
 const json={asset:{version:"2.0",generator:"Phoenix Asset Factory 0.1",copyright:"Original procedural asset for Phoenix World"},scene:0,scenes:[{name,nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials,accessors,bufferViews,buffers:[{byteLength:size,uri:"data:application/octet-stream;base64,"+encode(bytes)}]};
 return {name,json,bytes,triangles:nodes.reduce((sum,n)=>sum+accessors[meshes[n.mesh].primitives[0].attributes.POSITION].count/3,0)};
}
return [
asset("tree-meadow",p=>{
 p("trunk","bark",[0,.86,0],[.56,1.72,.56]);
 p("trunk","barkLight",[.22,1.22,.02],[.23,.95,.23],0,-.55);
 p("trunk","bark",[-.24,1.23,0],[.22,.95,.22],0,.53);
 for(const [x,y,z,s,m] of [[0,2.15,0,1.78,"leaf"],[-.61,1.73,.13,1.25,"leafDark"],[.57,1.88,-.17,1.35,"leafLight"],[.06,2.59,.02,1.25,"leafLight"],[.05,1.77,.58,1.14,"leaf"],[-.36,2.23,-.48,1.15,"leafGold"]])p("foliage",m,[x,y,z],[s,s*.89,s],x);
 for(const [x,z,r] of [[.2,.42,.17],[-.34,.24,.13],[.34,-.26,.12]])p("foliage","stoneLight",[x,r*.35,z],[r*2,r,r*2]);
}),
asset("cottage-lavender",p=>{
 p("box","stone",[0,.15,0],[4.1,.3,3.5]);p("box","wall",[0,1.5,0],[3.85,2.7,3.2]);
 p("roof","roof",[0,3.3,0],[4.5,1.5,3.95]);p("roof","roofLight",[0,3.39,0],[4.56,1.46,4.02]);
 for(const z of [-1.66,1.66])for(const x of [-1.82,1.82])p("box","trim",[x,1.55,z],[.19,2.55,.12]);
 p("box","trim",[0,.88,1.68],[1.02,1.5,.15]);p("box","bark",[0,.87,1.77],[.8,1.36,.07]);p("smooth","yellow",[.25,.86,1.83],[.1,.1,.1]);
 for(const x of [-1.21,1.21]){p("box","trim",[x,1.62,1.68],[.8,.86,.13]);p("box","glass",[x,1.62,1.76],[.66,.68,.09]);p("box","cream",[x,1.62,1.82],[.06,.68,.06]);p("box","cream",[x,1.62,1.82],[.66,.06,.06]);p("box","roofDark",[x,1.14,1.8],[.95,.13,.32]);for(let j=0;j<3;j++){p("foliage","leaf",[x-.26+j*.26,1.27,1.83],[.24,.25,.23]);p("smooth","flower",[x-.26+j*.26,1.42,1.84],[.14,.14,.14])}}
 p("box","stone",[1.15,3.45,-.65],[.55,1.45,.55]);p("box","stoneLight",[1.15,4.15,-.65],[.72,.2,.72]);
 p("box","stoneLight",[0,.1,2],[1.2,.2,.6]);p("box","trim",[0,2.51,1.69],[3.8,.12,.14]);
}),
asset("rock-moss",p=>{
 p("foliage","stone",[0,.38,0],[1.3,.78,1.0],.4,.12);
 p("foliage","stoneLight",[.48,.17,.24],[.6,.38,.6],.8);
 p("foliage","leafDark",[-.13,.66,.05],[.67,.22,.61],.5);
 p("foliage","leaf",[.14,.62,-.18],[.53,.18,.45],.2);
}),
asset("phoenix-companion",p=>{
 // Original V1 motifs: warm cream hood, pink ears, smiling face, violet orb.
 // Front is -Z. Facial details are deliberately outside the ellipsoid surface.
 p("plush","cream",[0,.43,.035],[.83,.76,.71]);
 p("plush","face",[0,.40,-.28],[.57,.57,.20]);
 p("plush","hood",[0,.94,.035],[1.09,.98,.88]);
 p("plush","face",[0,.91,-.27],[.93,.80,.41]);
 for(const sign of [-1,1]){
  const x=sign*.36;
  p("plush","hood",[x,1.42,.04],[.29,.49,.27],0,-sign*.42);
  p("plush","earPink",[x,1.43,-.096],[.17,.33,.067],0,-sign*.42);
  p("plush","cream",[sign*.385,.43,-.055],[.27,.39,.30],0,sign*.27);
  p("plush","cream",[sign*.25,.13,-.19],[.29,.21,.41]);
  // Eyes: dark espresso oval, warm iris, large visible catchlight.
  p("plush","eye",[sign*.19,.98,-.466],[.185,.225,.10]);
  p("plush","iris",[sign*.19,.935,-.510],[.114,.082,.025]);
  p("plush","white",[sign*.19-.035,1.035,-.516],[.060,.064,.027]);
  p("plush","white",[sign*.19+.037,.945,-.515],[.025,.026,.022]);
  p("plush","blush",[sign*.30,.817,-.426],[.143,.067,.045]);
 }
 p("plush","nose",[0,.865,-.482],[.067,.045,.047]);
 // Small curved smile, below nose; no exposed teeth or giant mouth.
 for(let i=-3;i<=3;i++){const x=i*.017;const y=.786+.00095*i*i;p("smooth","eye",[x,y,-.477],[.025,.022,.022])}
 // Violet crystal held below the face.
 p("plush","purpleDark",[0,.37,-.415],[.35,.35,.35]);
 p("plush","orb",[0,.37,-.47],[.30,.30,.30]);
 p("plush","white",[-.061,.424,-.596],[.069,.065,.029]);
 p("smooth","yellow",[.17,.37,-.475],[.045,.045,.045]);
 p("smooth","yellow",[-.17,.37,-.475],[.045,.045,.045]);
 p("plush","cream",[0,.40,.36],[.34,.30,.29]);

})
];
}

export {buildAssets};
if(typeof process!=="undefined"&&process.argv[1]){
 const {writeFileSync,mkdirSync}=await import("node:fs");
 const {resolve,dirname}=await import("node:path");
 const {fileURLToPath}=await import("node:url");
 if(resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const out=resolve(process.argv[2]||resolve(dirname(fileURLToPath(import.meta.url)),"../assets/models"));mkdirSync(out,{recursive:true});
  for(const a of buildAssets()){
   writeFileSync(resolve(out,a.name+".gltf"),JSON.stringify(a.json));
   const j=JSON.parse(JSON.stringify(a.json));delete j.buffers[0].uri;
   const raw=Buffer.from(JSON.stringify(j));const jp=(4-raw.length%4)%4;const bp=(4-a.bytes.length%4)%4;const total=12+8+raw.length+jp+8+a.bytes.length+bp;
   const glb=Buffer.alloc(total);glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(total,8);glb.writeUInt32LE(raw.length+jp,12);glb.writeUInt32LE(0x4e4f534a,16);raw.copy(glb,20);glb.fill(32,20+raw.length,20+raw.length+jp);const at=20+raw.length+jp;glb.writeUInt32LE(a.bytes.length+bp,at);glb.writeUInt32LE(0x004e4942,at+4);Buffer.from(a.bytes).copy(glb,at+8);writeFileSync(resolve(out,a.name+".glb"),glb);
   console.log(a.name,a.triangles+" triangles",glb.length+" bytes GLB");
  }
 }
}
