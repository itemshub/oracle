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
      if(url.includes("v1/search/v2/sell"))
      {
        //The maker api
      }
      if(url.includes("v1/steamtrade/sga/purchase"))
      {
        //The taker api

        console.log(
            JSON.stringify(
                JSON.parse(body)
            )
        )
      }
    //   console.log(url,JSON.parse(body))
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
        width: 1920,
        height: 1080,
  });
  await requestInjuection(page)

  await page.evaluateOnNewDocument(() => {
  // 彻底禁止所有跳转函数
  const block = () => console.warn("Redirect Blocked");

  // 禁用 location.href/assign/replace
  Object.defineProperty(window.location, "href", {
    set: block
  });
  window.location.assign = block;
  window.location.replace = block;

  // 禁用 window.open
  window.open = () => null;

  // 禁用 a 标签跳转
  document.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (a && a.href) {
      e.preventDefault();
      console.warn("Blocked <a> redirect:", a.href);
    }
  }, true);

  // 禁用 pushState / replaceState（防劫持）
  const origPush = history.pushState;
  const origReplace = history.replaceState;

  history.pushState = function () {
    console.warn("Blocked pushState");
  };

  history.replaceState = function () {
    console.warn("Blocked replaceState");
  };

  // 禁用 beforeunload
  window.addEventListener = new Proxy(window.addEventListener, {
    apply(target, thisArg, args) {
      if (args[0] === "beforeunload") {
        console.warn("Blocked beforeunload listener");
        return;
      }
      return Reflect.apply(target, thisArg, args);
    }
  });

  // 禁用 location.reload()
  window.location.reload = () => console.warn("Blocked reload()");
});


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
const makerUrl = "https://www.c5game.com/en/csgo/553482368/Prisma%20Case/sell"
const takerUrl = "https://www.c5game.com/en/csgo/553482368/Prisma%20Case/purchase"

async function fetchData() {
    const batchId = Date.now();
    await runWithTimeout(() => getData(0,takerUrl), 120000, 0);
    await sleep(120000);
}

fetchData()
