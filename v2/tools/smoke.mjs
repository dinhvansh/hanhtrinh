import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const url=process.env.PHOENIX_URL||"http://127.0.0.1:8000/v2/";
await mkdir("qa-output",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox","--use-angle=swiftshader","--enable-unsafe-swiftshader","--disable-dev-shm-usage"]});
const results=[];
async function test(label,fn){await fn();results.push(label);console.log("PASS",label)}
try{
 const page=await browser.newPage({viewport:{width:960,height:640}});page.setDefaultTimeout(45000);
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(url+"?qa=1&quality=low");
 const world=page.locator("#world"),dataset=()=>world.evaluate(el=>({...el.dataset}));
 await test("WebGL frame and 19 asset instances",async()=>{await page.waitForFunction(()=>document.querySelector("#world").dataset.ready==="true");await page.waitForFunction(()=>document.querySelector("#world").dataset.assets==="19/19");assert.equal(await page.locator("#fallback").isVisible(),false)});
 await test("English onboarding",async()=>{await page.locator("#welcome [data-locale]").selectOption("en");await page.locator("#name").fill("Explorer");await page.locator("#nameform button").click();assert.equal(await page.locator("html").getAttribute("lang"),"en");assert.equal(await page.locator("#welcome").isVisible(),false)});
 await page.screenshot({path:"qa-output/island-desktop.png"});
 await test("Guide and jump",async()=>{await page.locator("#guide").click();await page.waitForFunction(()=>document.querySelector("#world").dataset.guide==="true");await page.keyboard.press("Space");await page.waitForFunction(()=>Number(document.querySelector("#world").dataset.y)>.15);await page.waitForFunction(()=>Number(document.querySelector("#world").dataset.y)===0)});
 await test("Keyboard movement to station",async()=>{await page.keyboard.down("w");try{await page.waitForFunction(()=>document.querySelector("#world").dataset.near==="true",{},{timeout:60000})}finally{await page.keyboard.up("w")}assert(Number((await dataset()).z)<-7)});
 async function finishQuest(wrong=false){await page.keyboard.press("e");await page.locator("#lesson").waitFor({state:"visible"});await page.locator("#light").click();await page.locator("#answers button").click();if(wrong){await page.locator("#answers button").nth(0).click();assert.match(await page.locator("#feedback").innerText(),/Try again/)}await page.locator("#answers button").nth(1).click();await page.locator("#answers button").last().click();await page.locator("#answers button").nth(0).click();await page.locator("#answers button").last().click();assert.equal(await page.locator("#stars").innerText(),"1");await page.locator("#answers button").click()}
 await test("Rainbow experiment, retry, reward and replay",async()=>{await finishQuest(true);await finishQuest()});
 await test("Locale switch and persistence",async()=>{await page.locator("header [data-locale]").selectOption("vi");assert.equal(await page.locator("html").getAttribute("lang"),"vi");await page.reload();await page.waitForFunction(()=>document.querySelector("#world").dataset.ready==="true");assert.equal(await page.locator("#stars").innerText(),"1");assert.equal(await page.locator("html").getAttribute("lang"),"vi");assert.equal(await page.locator("#welcome").isVisible(),false)});
 await test("No uncaught desktop page errors",async()=>assert.deepEqual(errors,[]));
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const mobileErrors=[];mobile.on("pageerror",e=>mobileErrors.push(e.message));await mobile.goto(url+"?qa=1&quality=low");
 await test("Mobile viewport and touch input",async()=>{await mobile.waitForFunction(()=>document.querySelector("#world").dataset.ready==="true");await mobile.locator("#nameform button").tap();await mobile.locator(".touch").waitFor({state:"visible"});const b=await mobile.locator('[data-key="ArrowUp"]').boundingBox();const client=await mobile.context().newCDPSession(mobile);const p={x:b.x+b.width/2,y:b.y+b.height/2};await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[p]});try{await mobile.waitForFunction(()=>Number(document.querySelector("#world").dataset.z)<9.5)}finally{await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]})}await mobile.screenshot({path:"qa-output/island-mobile.png"});assert.deepEqual(mobileErrors,[])});
 console.log(JSON.stringify({passed:results.length,results},null,2));
}finally{await browser.close()}
