import {chromium} from "playwright";
import {mkdir} from "node:fs/promises";
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:["--no-sandbox","--use-angle=swiftshader","--enable-unsafe-swiftshader","--disable-dev-shm-usage"]});
await mkdir("art-review",{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")console.log(m.text())});
 for(const shot of ["wide","gameplay","character","phoenix","mobile"]){
  if(shot==="mobile") await page.setViewportSize({width:390,height:844});
  await page.goto("http://127.0.0.1:8000/v2/art-slice/?qa=1&shot="+(shot==="mobile"?"gameplay":shot));
  await page.waitForFunction(()=>window.artReady||window.artError,{},{timeout:120000});
  const fail=await page.evaluate(()=>window.artError);if(fail)throw Error(fail);
  await page.waitForTimeout(1500);
  await page.screenshot({path:"art-review/"+shot+".png"});console.log("RENDERED",shot,await page.evaluate(()=>window.artStats));
 }
 if(errors.length)throw Error(errors.join("\n"));
}finally{await browser.close()}
