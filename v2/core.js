(function(root){
"use strict";
const KEY="phoenix-world-v2",ID="rainbow-01";
const fresh=()=>({version:1,name:"",completed:{}});
function sanitize(x){if(!x||x.version!==1)return fresh();return {version:1,name:typeof x.name==="string"?x.name.trim().slice(0,24):"",completed:x.completed&&x.completed[ID]===true?{[ID]:true}:{}}}
function load(storage){try{return sanitize(JSON.parse(storage.getItem(KEY)))}catch{return fresh()}}
function save(storage,state){try{storage.setItem(KEY,JSON.stringify(sanitize(state)));return true}catch{return false}}
function reset(storage){try{storage.removeItem(KEY);return true}catch{return false}}
function complete(state){if(state.completed[ID])return false;state.completed[ID]=true;return true}
function stars(state){return state.completed[ID]===true?1:0}
const quiz=[{q:"q1",options:["q1a","q1b","q1c"],answer:1,explain:"q1ex"},{q:"q2",options:["q2a","q2b","q2c"],answer:0,explain:"q2ex"}];
root.PhoenixCore={KEY,ID,fresh,sanitize,load,save,reset,complete,stars,quiz};
})(globalThis);