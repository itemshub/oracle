async function getCS2InventoryFromTradeOffer(tradeOfferUrl) {
  const url = new URL(tradeOfferUrl);
  const partner = url.searchParams.get('partner');

  if (!partner) {
    throw new Error('Invalid trade offer URL');
  }

  // SteamID3(accountid) → SteamID64
  const steamId64 = (
    BigInt(partner) + BigInt('76561197960265728')
  ).toString();

  // 1️⃣ 初始化会话（非常关键）
  const initRes = await fetch(
    `https://steamcommunity.com/profiles/${steamId64}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }
  );

  const setCookie = initRes.headers.get('set-cookie') || '';

  // 2️⃣ 正式请求 inventory（必须带 start_assetid）
  const inventoryUrl =
    `https://steamcommunity.com/inventory/${steamId64}/730/2` +
    `?l=english&count=2000&start_assetid=0`;

  const res = await fetch(inventoryUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Cookie': setCookie,
    },
  });

  if (!res.ok) {
    throw new Error(`Steam inventory request failed: ${res.status}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error('Inventory not accessible (private or limited)');
  }

  const assets = data.assets || [];
  const descriptions = data.descriptions || [];

  const descMap = new Map();
  for (const d of descriptions) {
    descMap.set(`${d.classid}_${d.instanceid}`, d);
  }

  return assets.map(a => {
    const d = descMap.get(`${a.classid}_${a.instanceid}`);
    return {
      assetid: a.assetid,
      amount: a.amount,
      classid: a.classid,
      instanceid: a.instanceid,

      name: d?.name,
      market_hash_name: d?.market_hash_name,
      tradable: d?.tradable === 1,
      marketable: d?.marketable === 1,
      type: d?.type,
      tags: d?.tags || [],
      icon_url: d?.icon_url
        ? `https://community.cloudflare.steamstatic.com/economy/image/${d.icon_url}`
        : null,
    };
  });
}

class steam_class {
  constructor({ tradeUrl } = {}) {
    this.config = {
      tradeUrl
    };
  }

  /** 修改 config */
  setConfig(options) {
    this.config = {
      ...this.config,
      ...options,
      headers: {
        ...this.config.headers,
        ...(options.headers || {}),
      },
    };
  }

  /** 🧾 查询账号余额 GET /merchant/account/v1/balance */
  async getInventory() {
    return await getCS2InventoryFromTradeOffer(this.config.tradeUrl)
  }
}

module.exports = steam_class;
