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
const quiz=[
{q:"Ánh sáng trắng chứa gì?",options:["Chỉ một màu trắng","Nhiều màu ánh sáng trộn lại","Chỉ màu vàng"],answer:1,explain:"Ánh sáng trắng chứa nhiều màu khác nhau."},
{q:"Vì sao giọt nước giúp tạo cầu vồng?",options:["Ánh sáng bị khúc xạ, tách màu và phản xạ bên trong giọt","Giọt nước tự phát sáng","Giọt nước nhuộm màu bầu trời"],answer:0,explain:"Ánh sáng khúc xạ, tán sắc và phản xạ bên trong giọt nước trước khi đi tới mắt."}];
root.PhoenixCore={KEY,ID,fresh,sanitize,load,save,reset,complete,stars,quiz};
})(globalThis);