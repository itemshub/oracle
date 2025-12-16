const db = require("../../db/db")
const {sleep} = require("../utils")
const puppeteer = require("puppeteer-core");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

let requestCookiesFetch = false;
const requestInjuection = async (page)=>
{
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  page.on('response', async (response) => {
    try {
      const request = response.request();
      const url = request.url();
      const headers = request.headers();
      const status = response.status();
      let body = '';
      try {
        body = await response.text();
      } catch (err) {}
      if(url.includes("user/Account/GetUserInfo"))
      {
        // console.log(url)
        console.log(headers?.authorization,headers?.Authorization)
        await db.updateMinerAuth("uuyp_cookies",headers.authorization)
        console.log("uuyp_cookies updated")
      }
    } catch (err) {
    }
    
  });
    return true
}


async function auth_update() {
    const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--no-sandbox", "--disable-setuid-sandbox",'--lang=zh-CN,zh','--font-render-hinting=none'],
    
  });

  const page = await browser.newPage();
  await requestInjuection(page);
  await page.goto("https://www.youpin898.com/");

  let startLoop = false;
  page.on("framenavigated", frame => {
    if (frame === page.mainFrame()) {
            const currentUrl = frame.url();
            console.log("URL changed:", currentUrl);
            if(currentUrl.toLowerCase().includes("https://www.youpin898.com/mine"))
            {
                console.log("start loop")
                startLoop=true
            }
        }
    });


  // 轮询函数
  async function getStorage(page) {
    const resultText = await page.evaluate(`
      (() => {
        const data = {
          localStorage: {},
          sessionStorage: {},
          cookies: []
        };

        // localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data.localStorage[key] = localStorage.getItem(key);
        }

        // sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          data.sessionStorage[key] = sessionStorage.getItem(key);
        }

        // cookies
        data.cookies = document.cookie.split('; ').filter(Boolean).map(c => {
          const parts = c.split('=');
          const name = parts.shift();
          return { name, value: parts.join('=') };
        });

        return JSON.stringify(data);
      })()
    `);

    return JSON.parse(resultText);
  }

  while(true)
  {
    try {
        if(startLoop)
        {
            console.log("开始轮询 localStorage / sessionStorage / cookies...");
            const data = await getStorage(page);
            const ls = data.localStorage;
            const ss = data.sessionStorage;
            const ck = data.cookies;

            const emptyLocal = Object.keys(ls).length === 0;
            const emptySession = Object.keys(ss).length === 0;
            const emptyCookies = ck.length === 0;
            let workingCookies = true;
            for(let i of ck)
            {
                console.log(i)
                if(i.name == "csrftoken")
                {
                    workingCookies=false
                }
            }

            if (emptyLocal || emptySession || emptyCookies ) {
                // console.log(`[${new Date().toISOString()}] 条件未满足，继续等待...`);
                continue;
            }else{
                console.log("\n===== 条件满足！当前数据如下 =====");
                console.log(JSON.stringify(data, null, 2));
                //   await tables.pgyAuth.insert({data:JSON.stringify(data, null, 2)})
                await db.updateMinerAuth("uuyp_full",JSON.stringify(data, null, 2))
                console.log("轮询结束。");
                await sleep(5000)
                await browser.close();
                return 0 ;
            }
        }

    } catch (err) {
      console.error("检测错误:", err);
    }

    await sleep(1000);
  }
}

module.exports = {
  auth_update
}