const path = require('path');
//Chrome
const puppeteer = require("puppeteer-core");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let logIndex =0
const screenShotLog = async (page) =>
{
  logIndex++;
}

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

async function fetchMarketData() {
  const batchId = Date.now();
  await tables.markets_batch.insert({
    id: batchId,
    startTime: Date.now(),
    endTime: 0,
    status: 0
  });

  for (let i of markets) {
    await runWithTimeout(() => marketData(batchId, i.url), 120000, i.url);
    await sleep(120000);
  }

  await tables.markets_batch.update(
    { id: batchId },
    { $set: { endTime: Date.now(), status: 1 } },
    { multi: false }
  );
}

let finalData = {}

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
      }
      if(url.includes("purchase/order/getTemplatePurchaseOrderListPC"))
      {
        //The taker api
      }
      console.log(url,JSON.parse(body))
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
  await sleep(20000)
  console.log(finalData)
  await sleep(10000)
  try{
    await browser.close()
    return 0;
  }catch(e)
  {
    console.err("close error :",e)
    return 0;
  }
};

//urls
const makerUrl = "https://www.youpin898.com/market/goods-list?listType=10&templateId=102276&gameId=730"
const takerUrl = "https://www.youpin898.com/market/goods-list?listType=20&templateId=102276&gameId=730"

async function fetchData() {
    const batchId = Date.now();
    await runWithTimeout(() => getData(0,takerUrl), 120000, 0);
    await sleep(120000);
}

fetchData()