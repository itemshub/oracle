const path = require('path');
//Chrome
const puppeteer = require("puppeteer-core");
const Datastore = require('@seald-io/nedb')
const db_base = "./db/"
const dbs = {
    skins : db_base+"skins",
    skins_batch : db_base+"skins_batch",
    markets : db_base+"markets",
    markets_batch : db_base+"markets_batch",
}
const tables = {
    skins:new Datastore({ filename: dbs.skins, autoload: true }),
    skins_batch:new Datastore({ filename: dbs.skins_batch, autoload: true }),
    markets:new Datastore({ filename: dbs.markets, autoload: true }),
    markets_batch:new Datastore({ filename: dbs.markets_batch, autoload: true }),
}
const cases = require("./config/case.json")
const markets = require("./config/market.json")

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let logIndex =0
const screenShotLog = async (page) =>
{
  // await page.screenshot({ path: `./screenshot/test${logIndex}.png`, fullPage: false });
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
let finalDataMarket = {}
const marketData  =async (batchId,url) => {
  finalDataMarket = {};
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
  await page.goto(url, { waitUntil: "load" });
  await sleep(20000)

  const data = await page.evaluate(() => {
    const obj = {
      name: null,
      seller_fee: null,
      buyer_fee: null,
      founded: null,
      headquarters: null,
      monthly_visits: null,
    };

    const textNodes = Array.from(document.querySelectorAll("div,span,p,h1"));

    function findText(regex) {
      const el = textNodes.find(e => regex.test(e.textContent));
      return el ? el.textContent : "";
    }

    // 交易所名称（h1）
    const h1 = document.querySelector("h1");
    if (h1) obj.name = h1.textContent.trim();

    // seller fee
    const sellerText = findText(/Seller Fee/i);
    if (sellerText) {
      const m = sellerText.match(/Seller Fee\s*([\d\.]+%)/i);
      if (m) obj.seller_fee = m[1];
    }

    // buyer fee（可能不存在）
    const buyerText = findText(/Buyer Fee/i);
    if (buyerText) {
      const m = buyerText.match(/Buyer Fee\s*([\d\.]+%)/i);
      obj.buyer_fee = m ? m[1] : "0%";
    } else {
      obj.buyer_fee = "0%";
    }

    // founded
    const foundedText = findText(/Founded/i);
    if (foundedText) {
      const m = foundedText.match(/Founded\s*(.+)/i);
      if (m) obj.founded = m[1].trim();
    }

    // headquarters
    const hqText = findText(/Headquarters/i);
    if (hqText) {
      const m = hqText.match(/Headquarters\s*(.+)/i);
      if (m) obj.headquarters = m[1].trim();
    }

    // monthly visits
    const visitsText = findText(/Monthly Visits/i);
    if (visitsText) {
      const m = visitsText.match(/Monthly Visits\s*([\d\.]+M?)/i);
      if (m) obj.monthly_visits = m[1];
    }

    return obj;
  });
  finalDataMarket = data;
  finalDataMarket['id'] = batchId;
  finalDataMarket['timestamp'] = Date.now()
  await tables.markets.insert(finalDataMarket);
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


async function fetchSkinData() {
  const batchId = Date.now();
  await tables.skins_batch.insert({
    id: batchId,
    startTime: Date.now(),
    endTime: 0,
    status: 0
  });

  for (let i of cases) {
    await runWithTimeout(() => casesData(batchId, i.url), 120000, i.url);
    await sleep(120000);
  }

  await tables.skins_batch.update(
    { id: batchId },
    { $set: { endTime: Date.now(), status: 1 } },
    { multi: false }
  );
}
let finalDataCases = {}
const casesData  =async (batchId,url) => {
  finalDataCases = {};
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
  await page.goto(url, { waitUntil: "load" });
  await sleep(20000)

  const data = await page.evaluate(() => {

  // K/M/B 解析函数
  function parseKM(numStr) {
    numStr = numStr.trim();

    // 去除逗号
    numStr = numStr.replace(/,/g, '');

    if (/^\d+(\.\d+)?$/.test(numStr)) {
      return parseFloat(numStr);
    }

    const match = numStr.match(/^([\d\.]+)\s*([KMB])$/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    const multipliers = {
      K: 1000,
      M: 1000 * 1000,
      B: 1000 * 1000 * 1000
    };

    return value * multipliers[unit];
  }

  const results = [];

  // 获取所有 active offers 区块
  const offerBlocks = Array.from(document.querySelectorAll('div'))
    .filter(el => /active offers/i.test(el.textContent));

  offerBlocks.forEach(block => {
    // 交易所名称
    const nameEl = block.querySelector('a') || block.querySelector('strong') || block;
    const name = nameEl ? nameEl.textContent.trim() : null;

    // 获取 price：from $14.72
    const priceMatch = block.textContent.match(/from\s*\$([\d,]+(\.\d+)?)/i);
    const price = priceMatch ?
      parseFloat(priceMatch[1].replace(/,/g, '')) :
      null;

    // 获取 active offers：6K, 12, 3.2M, 850
    const offersMatch = block.textContent.match(/active offers\s*([\d\.KMB,]+)/i);

    let active_offers = null;
    if (offersMatch && offersMatch[1]) {
      active_offers = parseKM(offersMatch[1]);
    }

    if (name && price != null && active_offers != null) {
      results.push({
        name,
        price,
        active_offers
      });
    }
  });
  return results;
  });
  finalDataCases['data'] = data;
  finalDataCases['id'] = batchId;
  finalDataCases['timestamp'] = Date.now()
  await tables.skins.insert(finalDataCases);
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

// fetchMarketData()
fetchSkinData()