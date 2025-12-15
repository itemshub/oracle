
class uuyp_class {
  constructor({ cookie, baseURL = 'https://api.youpin898.com' } = {}) {
    this.config = {
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : cookie
      },
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

  /** 核心 fetch 请求封装 */
  async request(path, method = 'GET', body = null, query = {}) {
    // 必带 app-key
    const url = new URL(`${this.config.baseURL}${path}`);
    // url.searchParams.set('Cookie', this.config.cookie);

    // 附加额外 query
    for (const key in query) {
      if (query[key] !== undefined && query[key] !== null) {
        url.searchParams.set(key, query[key]);
      }
    }

    const opts = {
      method,
      headers: this.config.headers,
    };

    if (body) {
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), opts);
    const json = await res.json();
    return json;
  }

  /** 🧾 查询账号余额 GET /merchant/account/v1/balance */
  async getBalance() {
    return this.request('/api/user/Account/GetUserInfo', 'GET');
  }

  /** 👤 查询用户 steam 信息 GET /merchant/account/v1/steamInfo */
  async getSteamInfo() {
    return this.request('/merchant/account/v1/steamInfo', 'GET');
  }

  /** 📜 在售列表 GET /merchant/sale/v1/search */
  async searchSaleList(query = {}) {
    return this.request('/merchant/sale/v1/search', 'GET', null, query);
  }

  /** 📦 在售饰品改价 POST /merchant/sale/v1/modify */
  async modifySale(body) {
    return this.request('/merchant/sale/v1/modify', 'POST', body);
  }

  /** 📤 下架在售饰品 POST /merchant/sale/v1/offsale */
  async offSale(body) {
    return this.request('/merchant/sale/v1/offsale', 'POST', body);
  }

  /** 📦 发起求购 POST /merchant/purchase/v1/create */
  async createPurchase(body) {
    return this.request('/merchant/purchase/v1/create', 'POST', body);
  }

  /** ❌ 取消求购 POST /merchant/purchase/v1/cancel */
  async cancelPurchase(body) {
    return this.request('/merchant/purchase/v1/cancel', 'POST', body);
  }

  /** 📊 求购列表 GET /merchant/purchase/v1/list */
  async listPurchases(query = {}) {
    return this.request('/merchant/purchase/v1/list', 'GET', null, query);
  }

  /** 📜 求购详情 GET /merchant/purchase/v1/detail */
  async getPurchaseDetail(query = {}) {
    return this.request('/merchant/purchase/v1/detail', 'GET', null, query);
  }

  /** 🏷 求购最高价 GET /merchant/purchase/v1/top */
  async getPurchaseTop(query = {}) {
    return this.request('/merchant/purchase/v1/top', 'GET', null, query);
  }

  /** 🧾 卖家订单列表 GET /merchant/order/v1/list */
  async listSellerOrders(query = {}) {
    return this.request('/merchant/order/v1/list', 'GET', null, query);
  }

  /** 🚚 发货接口 POST /merchant/order/v1/deliver */
  async deliverOrder(body) {
    return this.request('/merchant/order/v1/deliver', 'POST', body);
  }

  /** 📌 买家订单状态列表 POST /merchant/order/v2/buyer/status */
  async buyerOrderStatus(body) {
    return this.request('/merchant/order/v2/buyer/status', 'POST', body);
  }

  /** 📄 订单详情 GET /merchant/order/v2/buy/detail */
  async getOrderDetail(query = {}) {
    return this.request('/merchant/order/v2/buy/detail', 'GET', null, query);
  }

  /** 🛒 普通购买 POST /merchant/trade/v2/normal-buy */
  async normalBuy(body) {
    return this.request('/merchant/trade/v2/normal-buy', 'POST', body);
  }

  /** ⚡ 快速购买 POST /merchant/trade/v2/quick-buy */
  async quickBuy(body) {
    return this.request('/merchant/trade/v2/quick-buy', 'POST', body);
  }

  /** 📊 价格查询（Dev/未完全定义） GET /price/info */
  async getPriceInfo(query = {}) {
    return this.request('/price/info', 'GET', null, query);
  }

  /** 标准接口集 */

  async balance()
  {
    try{
        const bal = await this.getBalance();
        return Number(bal.Data?.Balance)/7; //Value in USD
    }catch(e)
    {
        console.error(e)
        return 0;
    }
  }
}

module.exports = uuyp_class;
