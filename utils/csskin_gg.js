const path = require('path');
//Chrome
const puppeteer = require("puppeteer-core");
const { MongoTable } = require('../db/db');
const tables = {
    skins: new MongoTable("skins"),
    skins_batch: new MongoTable("skins_batch"),
    markets: new MongoTable("markets"),
    markets_batch: new MongoTable("markets_batch"),
};
const cases = require("../config/case.json")
const markets = require("../config/market.json");

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
    await runWithTimeout(() => casesData(batchId,i.id, i.url), 120000, i.url);
    await sleep(120000);
  }

  await tables.skins_batch.update(
    { id: batchId },
    { $set: { endTime: Date.now(), status: 1 } },
    { multi: false }
  );
}
let finalDataCases = {}
const casesData  =async (batchId,skin,url) => {
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

  const _data = await page.evaluate(() => {
    function text(el) {
        return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    }

    // 通用单位转换（支持 K / M / B）
    function parseUnitNumber(str) {
        if (!str) return "";

        const match = str.match(/([\d.,]+)\s*([KMB])?/i);
        if (!match) return "";

        let num = parseFloat(match[1].replace(/,/g, ""));
        const unit = match[2] ? match[2].toUpperCase() : "";

        if (unit === "K") num *= 1000;
        if (unit === "M") num *= 1000000;
        if (unit === "B") num *= 1000000000;

        return Math.round(num * 100) / 100; // 保留两位小数
    }

    // 提取数字（带单位）
    function extractNumber(str) {
        const m = str.match(/[\d.,]+[KMB]?/i);
        return m ? m[0] : "";
    }

    const result = [];
    const cards = document.querySelectorAll(".active-offer");

    cards.forEach(card => {

        // ---- 基本信息 ----
        const nameA = card.querySelector("a.custom-underline");
        const name = nameA ? text(nameA) : "";
        const market_url = nameA ? nameA.href : "";
        const img_url = card.querySelector("a.custom-underline img")?.src ?? "";

        const promoted = !!card.querySelector('[data-template="recommended-info"], .text-orange-400');

        // ---- TrustScore ----
        const trustLink = Array.from(card.querySelectorAll("a"))
            .find(a => a.href.includes("trustpilot.com"));
        const trust_score_text = trustLink ? text(trustLink) : "";

        // ---- Active Offers ----
        let active_offers = "";

        const allTextNodes = Array.from(card.querySelectorAll("*"))
            .map(el => text(el))
            .filter(t => /active offers?/i.test(t));

        for (const t of allTextNodes) {
            const raw = extractNumber(t);
            if (raw) {
                active_offers = parseUnitNumber(raw);
                break;
            }
        }

        // ---- Price（去除美元符号 + 支持单位转换） ----
        let price = "";

        const priceEl = Array.from(card.querySelectorAll("div.font-bold"))
            .find(el => /\$[\d.,]+[KMB]?/i.test(text(el)));

        if (priceEl) {
            const priceRaw = text(priceEl).replace(/[^0-9KMB.,]/gi, "");  
            price = parseUnitNumber(priceRaw);
        }

        // ---- Offer URL ----
        const offerBtn = Array.from(card.querySelectorAll("a"))
            .find(a =>
                (/offer/i.test(a.textContent) || /buy/i.test(a.textContent)) &&
                !a.href.includes("trustpilot")
            );
        const offer_url = offerBtn ? offerBtn.href : "";

        result.push({
            name,
            market_url,
            img_url,
            trust_score_text,
            active_offers,   // 纯数字
            price,           // 纯数字（已去 "$"）
            offer_url,
            promoted
        });
    });
    return result;
  });
  finalDataCases['skin'] = skin;
  finalDataCases['data'] = _data;
  finalDataCases['id'] = batchId;
  finalDataCases['timestamp'] = Date.now()
  await tables.skins.insert(finalDataCases);
  console.log(_data)
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
// fetchSkinData()
module.exports = {
  fetchMarketData,
  fetchSkinData
}