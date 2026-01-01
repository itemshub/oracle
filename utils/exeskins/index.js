const path = require('path');
const cfg = require("../../config/config.json")
//Chrome
const puppeteer = require("puppeteer-core");
const { delChromeProfile } = require('../utils');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let taker_data = {};
let maker_data = {};

const getData  =async (batchId,url) => {
  finalData = {};
  const browser = await puppeteer.launch({
    executablePath: chromePath,          // 真实 Chrome 路径
    headless: false,                     // 非 headless
    defaultViewport: null,               // 使用完整窗口
    userDataDir: "./chrome_profile",     // ★ 持久化用户目录（关键）

    args: [
      "--start-maximized",

      // ====== 保留 Chrome 所有缓存（默认 Puppeteer 会改 flags）======
      "--disk-cache-dir=./chrome_cache",  // ★ 指定磁盘缓存路径
      "--disk-cache-size=0",              // ★ 0 = 不限制缓存大小
      "--media-cache-size=0",
      "--aggressive-cache-discard",       // 根据需要可删
      "--disable-background-networking",  // 可选，减少干扰

      // ====== 让浏览器表现更真实 ======
      "--no-default-browser-check",
      "--no-first-run",
      "--disable-infobars",
      "--lang=zh-CN,zh",

      // ====== 如果你希望规避沙盒 ======
      "--no-sandbox",
      "--disable-setuid-sandbox",

      // ====== 字体和渲染调整 ======
      "--font-render-hinting=none",

      // ====== 多进程优化 ======
      "--disable-dev-shm-usage",
      "--ignore-gpu-blocklist",
      "--enable-gpu-rasterization",
      "--enable-features=NetworkService"
    ]
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'zh-CN,zh;q=0.9'
    });
  await page.setViewport({
        width: 1920,
        height: 1080,
  });
  await page.goto(url, { waitUntil: "load" }).catch(() => {}); 

  await sleep(5000)

  finalData = await page.evaluate(() => {
    const results = [];

    const items = document.querySelectorAll('a.item');

    items.forEach(item => {
      const img = item.querySelector('img[alt]');
      const name = img ? img.getAttribute('alt') : null;

      const priceEl = item.querySelector('strong.font-dm-mono');
      const price = priceEl
        ? priceEl.innerText.replace('$', '').trim()
        : null;

      if (name && price) {
        results.push({
          name,
          price
        });
      }
    });

    return results; // ⭐ 必须 return，才能传回 Node.js
  });

  // console.log(finalData);

  maker_data = finalData;
  await sleep(1000)
  try{
    await browser.close()
    return 0;
  }catch(e)
  {
    console.err("close error :",e)
    return 0;
  }
};

async function fetchData(url) {
    await getData(0,url)
    // await sleep(120000);
}
async function taker(cases)
{
   return 0 ;
}

async function maker(cases)
{
    maker_data = {};
    await fetchData(`https://exeskins.com/?search=${cases.name}&sortBy=price&direction=asc&typeSlug=container`)
    if(maker_data && maker_data?.length > 0)
    {
      return maker_data[0]?.price ? maker_data[0]?.price : 0
    }
   return 0 ;
}

async function price(cases) {
  await delChromeProfile()
  return {
    taker:0,
    maker: (await maker(cases))
  }
}
module.exports = {
  taker,
  maker,
  price
}