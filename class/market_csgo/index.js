class market_csgo_class {
  /**
   * @param {Object} options
   * @param {string} options.apiKey - API Key
   * @param {string} options.baseUrl - API 基础 URL
   */
  constructor({ cookie = '', baseUrl = 'https://market.csgo.com/api/v2' } = {}) {
    this.config = {
      apiKey:cookie,
      baseUrl
    };
  }

  /**
   * 修改配置
   * @param {Object} cfg
   */
  setConfig(cfg) {
    this.config = { ...this.config, ...cfg };
  }

  /**
   * 内部统一请求
   * @param {string} path
   * @param {Object} params
   * @param {string} method
   */
  async request(path, params = {}, method = 'GET') {
    const url = new URL(`${this.config.baseUrl}/${path}`);
    // 传入 apiKey 到 query
    if (this.config.apiKey) {
      url.searchParams.set('key', this.config.apiKey);
    }

    if (method === 'GET') {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          url.searchParams.set(k, v);
        }
      });
    }

    const options = { method };

    if (method !== 'GET') {
      options.body = JSON.stringify(params);
      options.headers = { 'Content-Type': 'application/json' };
    }

    const res = await fetch(url.toString(), options);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    return res.json();
  }

  /* ----------------- Market Info ----------------- */

  // price list（最佳报价）
  async getPrices(currency = 'USD') {
    return this.request(`prices/${currency}.json`);
  }

  // full export 所有报价
  async getFullExport(currency = 'USD') {
    return this.request(`full-export/${currency}.json`);
  }

  // items list
  async getItems() {
    return this.request('items');
  }

  // bid-ask 报价深度
  async getBidAsk(hash_name, phase) {
    return this.request('bid-ask', { hash_name, phase });
  }

  /* ----------------- Sell / Buy ----------------- */

  async addToSale({ id, price, cur = 'USD' }) {
    return this.request('add-to-sale', { id, price, cur });
  }

  async massAddToSale(items = [], cur = 'USD') {
    return this.request('mass-add-to-sale', { items, cur }, 'POST');
  }

  async setPrice({ item_id, price, cur = 'USD' }) {
    return this.request('set-price', { item_id, price, cur });
  }

  async massSetPrice(items = [], cur = 'USD') {
    return this.request('mass-set-price', { items, cur }, 'POST');
  }

  async removeAllFromSale() {
    return this.request('remove-all-from-sale');
  }

  async buy({ id, cur = 'USD' }) {
    return this.request('buy', { id, cur });
  }

  async buyFor({ id, steamid, cur = 'USD' }) {
    return this.request('buy-for', { id, steamid, cur });
  }

  /* ----------------- Inventory ----------------- */

  async myInventory(lang = 'en') {
    return this.request('my-inventory', { lang });
  }

  async inventoryStatus() {
    return this.request('inventory-status');
  }

  /* ----------------- Trade / Orders ----------------- */

  async getTrades() {
    return this.request('trades');
  }

  async tradeReady({ id }) {
    return this.request('trade-ready', { id });
  }

  async getOrders() {
    return this.request('get-orders');
  }

  async setOrder({ item_id, price, type }) {
    return this.request('set-order', { item_id, price, type });
  }

  async deleteOrders({ item_id }) {
    return this.request('delete-orders', { item_id });
  }

  /* ----------------- Account ----------------- */

  async getMoney() {
    return this.request('get-money');
  }

  async updateInventory() {
    return this.request('update-inventory');
  }

  async getSteamID() {
    return this.request('get-my-steam-id');
  }

  /* ----------------- Search ----------------- */

  async searchByHashName(hash_name) {
    return this.request('search-item-by-hash-name', { hash_name });
  }

  async searchSpecific(hash_name) {
    return this.request('search-item-by-hash-name-specific', { hash_name });
  }

  async searchListByHashNames(list = []) {
    const urlParams = {};
    list.forEach((v, i) => (urlParams[`list_hash_name[]`] = v));
    return this.request('search-list-items-by-hash-name-all', urlParams);
  }

  /* ----------------- History ----------------- */

  async getHistory() {
    return this.request('history',{
      date:((Date.now()-3600000*24*14)/1000).toFixed(0),
      date_end:(Date.now()/1000).toFixed(0)
    });
  }

  async getSalesHistoryByHash(list_hash_name = []) {
    const urlParams = {};
    list_hash_name.forEach((v) => (urlParams[`list_hash_name[]`] = v));
    return this.request('get-list-items-info', urlParams);
  }

  
  /**
   * 标准接口集
   */

  async balance()
  {
    try{
        const bal = await this.getMoney();
        return Number(bal.money); //Value in USD
    }catch(e)
    {
        console.error(e)
        return 0;
    }
  }
}

module.exports = market_csgo_class;
