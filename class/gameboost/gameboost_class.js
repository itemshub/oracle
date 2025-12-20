
class GameboostClass {
  constructor({ apiKey = '', baseUrl = 'https://api.gameboost.com/v2' } = {}) {
    this.config = {
      apiKey,
      baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey ? `Bearer ${apiKey}` : '',
      },
    };
  }

  /**
   * 动态更新配置（比如切换 apiKey）
   */
  updateConfig({ apiKey, baseUrl }) {
    if (apiKey) {
      this.config.apiKey = apiKey;
      this.config.headers.Authorization = `Bearer ${apiKey}`;
    }
    if (baseUrl) {
      this.config.baseUrl = baseUrl;
    }
    return this.config;
  }

  /**
   * 内部通用请求方法
   * method: GET|POST|PATCH|DELETE
   * path: /account-offers, /item-offers etc.
   * params: 查询参数对象
   * body: 请求体对象
   */
  async request(method, path, { params = {}, body = null } = {}) {
    try {
      let url = new URL(`${this.config.baseUrl}${path}`);

      // 加入 query 参数
      if (params && Object.keys(params).length) {
        Object.keys(params).forEach(key =>
          url.searchParams.append(key, params[key])
        );
      }

      const options = {
        method,
        headers: this.config.headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url.toString(), options);

      // 全局基础错误处理
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        // 非 JSON 响应
      }

      if (!res.ok) {
        const err = new Error(data.message || res.statusText);
        err.status = res.status;
        err.response = data;
        throw err;
      }
      return data;
    } catch (err) {
      // 可统一处理错误日志
      console.error('GameBoost API Error:', err);
      throw err;
    }
  }

  /** ============================
   * 账户出售信息（Account Offers）
   * 文档参考 /account-offers
   * ========================== */

  // 获取列表
  listAccountOffers({ filter = {}, page = 1, limit = 15 } = {}) {
    return this.request('GET', '/account-offers', {
      params: {
        ...filter,
        per_page: limit,
        page,
      },
    });
  }

  // 根据 ID 获取单个账号报价
  getAccountOffer(id) {
    return this.request('GET', `/account-offers/${id}`);
  }

  // 创建账号报价
  createAccountOffer(body) {
    return this.request('POST', '/account-offers', { body });
  }

  // 修改账号报价
  updateAccountOffer(id, body) {
    return this.request('PATCH', `/account-offers/${id}`, { body });
  }

  // 删除账号报价
  deleteAccountOffer(id) {
    return this.request('DELETE', `/account-offers/${id}`);
  }

  /** ============================
   * 道具出售信息（Item Offers）
   * 文档参考 /item-offers
   * ========================== */

  listItemOffers({ filter = {}, page = 1, limit = 15 } = {}) {
    return this.request('GET', '/item-offers', {
      params: { ...filter, per_page: limit, page },
    });
  }

  getItemOffer(id) {
    return this.request('GET', `/item-offers/${id}`);
  }

  createItemOffer(body) {
    return this.request('POST', '/item-offers', { body });
  }

  updateItemOffer(id, body) {
    return this.request('PATCH', `/item-offers/${id}`, { body });
  }

  deleteItemOffer(id) {
    return this.request('DELETE', `/item-offers/${id}`);
  }

  // 上架道具
  listItemOffer(id) {
    return this.request('POST', `/item-offers/${id}/list`);
  }

  /** ============================
   * 订单相关
   * /account-orders, /item-orders etc.
   * ========================== */

  listAccountOrders({ filter = {}, page = 1, limit = 15 } = {}) {
    return this.request('GET', '/account-orders', {
      params: { ...filter, per_page: limit, page },
    });
  }

  listItemOrders({ filter = {}, page = 1, limit = 15 } = {}) {
    return this.request('GET', '/item-orders', {
      params: { ...filter, per_page: limit, page },
    });
  }

  // 获取单笔订单
  getAccountOrder(id) {
    return this.request('GET', `/account-orders/${id}`);
  }

  getItemOrder(id) {
    return this.request('GET', `/item-orders/${id}`);
  }

  /** ============================
   * 提现 / 支付 Payouts
   * ========================== */

  listPayoutRequests({ filter = {}, page = 1, limit = 15 } = {}) {
    return this.request('GET', '/payouts', {
      params: { ...filter, per_page: limit, page },
    });
  }

  getPayoutRequest(id) {
    return this.request('GET', `/payouts/${id}`);
  }

  // 同理可添加 create / cancel 等
}

module.exports = GameboostClass;
