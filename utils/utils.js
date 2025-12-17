const fs = require('fs/promises');
const path = require('path');
async function delChromeProfile() {
  // 1️⃣ 杀 chrome 进程（忽略错误与输出）
  await new Promise((resolve) => {
    exec('taskkill /IM chrome.exe /F >nul 2>&1', () => resolve());
  });
  await sleep(1000)
  // 2️⃣ 删除 chrome_profile 下所有内容
  const dir = path.resolve(__dirname, './chrome_profile');

  try {
    const entries = await fs.readdir(dir);

    await Promise.all(
      entries.map(name =>
        fs.rm(path.join(dir, name), {
          recursive: true,
          force: true,
        })
      )
    );
  } catch (e) {
    // 目录不存在直接忽略
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
}



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    sleep,
    delChromeProfile
}