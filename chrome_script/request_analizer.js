
//Chrome
const puppeteer = require("puppeteer-core");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const requestInjuection = async (page)=>
{
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    request.continue();
  });
  page.on('response', async (response) => {
    try {
      const request = response.request();
      const url = request.url();
    //   const headers = response.headers();
    //   const status = response.status();
      let body = '';
      try {
        body = await response.text();
      } catch (err) {}
      console.log("🐞 New Request :: ",url)
      console.log(JSON.stringify(body))
    } catch (err) {
    //   console.error('Response parsing error:', err);
    }
    
  });
    return true
}

const request_analyze = async (url) => {
  let finalData = {};

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    defaultViewport: null,
    userDataDir: "./chrome_profile",
    args: [
      "--start-maximized",
      "--disk-cache-dir=./chrome_cache",
      "--disk-cache-size=0",
      "--media-cache-size=0",
      "--no-default-browser-check",
      "--no-first-run",
      "--disable-infobars",
      "--lang=zh-CN,zh",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--font-render-hinting=none",
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

  await requestInjuection(page);

  // 仅等待 load，不等待网络空闲
  await page.goto(url, { waitUntil: "load" });

  // ✅ 固定等待 5 秒（不关心网络状态）
  await sleep(5000);

  // ✅ 获取当前页面完整 DOM
  const pageInfo = await page.evaluate(() => {
    return {
      url: location.href,
      title: document.title,
      html: document.documentElement.outerHTML,
      elementsCount: document.getElementsByTagName('*').length,
      timestamp: Date.now()
    };
  });

  // ✅ 打印（HTML 可能很大，按需处理）
  console.log("===== PAGE ANALYZE RESULT =====");
  console.log("URL:", pageInfo.url);
  console.log("TITLE:", pageInfo.title);
  console.log("ELEMENT COUNT:", pageInfo.elementsCount);
  console.log("HTML:");
  console.log(pageInfo.html);
  console.log("===== END =====");

  try {
    await browser.close();
    return pageInfo;
  } catch (e) {
    console.error("close error:", e);
    return pageInfo;
  }
};


module.exports = {
    request_analyze
}