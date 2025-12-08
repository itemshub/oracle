const path = require('path');
const cfg = require("../../config/config.json")
//Chrome
const puppeteer = require("puppeteer-core");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let taker_data = {};
let maker_data = {};
async function runWithTimeout(fn, ms, urlLabel = "") {
  const timeoutPromise = new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      clearTimeout(t);
      reject(new Error(`⏰ 超时：${ms}ms url=${urlLabel}`));
    }, ms);
  });

  return Promise.race([
    Promise.resolve().then(fn),
    timeoutPromise
  ]).catch(err => {
    console.error(`⚠️ 任务执行失败 url=${urlLabel}`, err);
  });
}

const requestInjuection = async (page)=>
{
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  page.on('response', async (response) => {
    try {
      const request = response.request();
      const url = request.url();
      const headers = response.headers();
      const status = response.status();
      let body = '';
      try {
        body = await response.text();
      } catch (err) {}
      if(url.includes("goods/market/queryOnSaleCommodityList"))
      {
        //The maker api
        maker_data = JSON.parse(JSON.stringify(
          (JSON.parse(body))?.Data
        ))
        // console.log(body)
      }
      if(url.includes("purchase/order/getTemplatePurchaseOrderListPC"))
      {
        //The taker api
        taker_data = JSON.parse(JSON.stringify(
          (JSON.parse(body))?.data
        ))
      }
      // console.log(url,JSON.parse(body))
    } catch (err) {
    //   console.error('Response parsing error:', err);
    }
    
  });
    return true
}


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
        width: 1080,
        height: 720,
  });
  await requestInjuection(page)
  await page.goto(url, { waitUntil: "load" });
  await sleep(15000)
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
    await getData(0,url);
}

async function taker(cases)
{
    taker_data = {};
    await fetchData(`https://www.youpin898.com/market/goods-list?listType=20&templateId=${cases.uuyp_id}&gameId=730`)
    // console.log(taker_data)
    if(taker_data?.purchaseOrderResponseList && taker_data.purchaseOrderResponseList?.length > 0)
    {
      return taker_data.purchaseOrderResponseList[0]?.purchasePrice ? taker_data.purchaseOrderResponseList[0]?.purchasePrice : 0
    }
   return 0 ;
}

async function maker(cases)
{
    maker_data = {};
    await fetchData(`https://www.youpin898.com/market/goods-list?listType=10&templateId=${cases.uuyp_id}&gameId=730`)
    // console.log(maker_data)
    if( maker_data?.length > 0)
    {
      return maker_data[0]?.price ? maker_data[0]?.price : 0
    }
   return 0 ;
}

async function price(cases) {
  return {
    taker: (await taker(cases))/cfg.usdtocny,
    maker: (await maker(cases))/cfg.usdtocny
  }
}
module.exports = {
  taker,
  maker,
  price
}