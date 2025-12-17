// list_skin_class.js
// Node.js >=18 原生支持 fetch
// Node <18 请取消下一行注释
// const fetch = require('node-fetch');

class lis_skin_class {
  constructor({ cookie = '', config = {} } = {}) {
    this.config = {
      baseURL: 'https://api.lis-skins.com/v1',
      apiKey: cookie,
      timeout: 15000,
      ...config,
    };
  }

  /* ================== 基础配置 ================== */

  setApiKey(apiKey) {
    this.config.apiKey = apiKey;
  }

  setConfig(cfg = {}) {
    this.config = { ...this.config, ...cfg };
  }

  _headers() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }

  async _request(method, path, { query, body } = {}) {
    let url = this.config.baseURL + path;

    if (query && Object.keys(query).length) {
      const qs = new URLSearchParams();
      for (const k in query) {
        const v = query[k];
        if (Array.isArray(v)) {
          v.forEach(i => qs.append(`${k}[]`, i));
        } else if (v !== undefined && v !== null) {
          qs.append(k, v);
        }
      }
      url += `?${qs.toString()}`;
    }

    const res = await fetch(url, {
      method,
      headers: this._headers(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error('LIS-SKINS API Error');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  /* ================== User ================== */

  // GET /user/balance
  getUserBalance() {
    return this._request('GET', '/user/balance');
  }

  /* ================== Market ================== */

  // GET /market/search
  searchMarket(params) {
    /**
     * params = {
     *   game: 'csgo',
     *   names: [],
     *   only_unlocked: 0|1,
     *   unlock_days: [],
     *   sort_by,
     *   price_from,
     *   price_to,
     *   float_from,
     *   float_to,
     *   cursor
     * }
     */
    return this._request('GET', '/market/search', { query: params });
  }

  // POST /market/buy
  buySkins(data) {
    /**
     * data = {
     *   ids: [id],
     *   partner,
     *   token,
     *   max_price?,
     *   custom_id?,
     *   skip_unavailable?
     * }
     */
    return this._request('POST', '/market/buy', { body: data });
  }

  // GET /market/info
  getPurchaseInfo(query) {
    /**
     * query = {
     *   custom_ids?: [],
     *   purchase_ids?: []
     * }
     */
    return this._request('GET', '/market/info', { query });
  }

  // GET /market/history
  getPurchaseHistory(query) {
    /**
     * query = {
     *   start_unix_time?,
     *   end_unix_time?,
     *   page?
     * }
     */
    return this._request('GET', '/market/history', { query });
  }

  // POST /market/withdraw
  withdraw(data) {
    /**
     * data = {
     *   custom_id?,
     *   purchase_id?,
     *   partner?,
     *   token?
     * }
     */
    return this._request('POST', '/market/withdraw', { body: data });
  }

  // POST /market/withdraw-all
  withdrawAll(data = {}) {
    /**
     * data = {
     *   custom_ids?,
     *   purchase_ids?,
     *   partner?,
     *   token?
     * }
     */
    return this._request('POST', '/market/withdraw-all', { body: data });
  }

  // POST /market/return
  returnLockedSkins(data) {
    /**
     * data = {
     *   custom_id?,
     *   purchase_id?,
     *   id?
     * }
     */
    return this._request('POST', '/market/return', { body: data });
  }

  // GET /market/check-availability
  checkAvailability(ids) {
    return this._request('GET', '/market/check-availability', {
      query: { ids },
    });
  }

  /**
   * 标准接口
   */
    async balance()
  {
    try{
        const bal = await this.getUserBalance();
        return Number(bal.data.balance); //Value in USD
    }catch(e)
    {
        console.error(e)
        return 0;
    }
  }
}

module.exports = lis_skin_class;
