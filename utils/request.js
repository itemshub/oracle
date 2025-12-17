const request = require('request');
async function doRequest(options)
{
    return new Promise(function (resolve, reject) {
        request(options, function (error, response) {
            if (error) throw new Error(error);
            rawData = false;
            try{
                rawData = JSON.parse(response.body);
            }catch(e)
            {
                console.error(e,response.body)
            }
            resolve(rawData);
        });
      });
}

require('dotenv').config()
const base_url ={
    market:"https://market.csgo.com/api",
    buff:"https://buff.163.com/api",
    igxe:"https://www.igxe.cn",
    csgo_buy:"https://csgobuy.cn/api",
    cs_money:"https://cs.money",
    lis_skin:"https://api.lis-skins.com"
}
const router = {
    buff:{
        price:`${base_url.buff}/market/goods/sell_order?game=csgo&page_num=1&sort_by=default&mode=&allow_tradable_cooldown=1&goods_id=`,
        buy_order:`${base_url.buff}/market/goods/buy_order?game=csgo&page_num=1&goods_id=`
    },
    igxe:{
        price:`${base_url.igxe}/product/trade/730/`,
        buy_order:`${base_url.igxe}/purchase/get_product_purchases?product_id=`
    },
    market:{
        order_usd:`${base_url.market}/v2/prices/orders/USD.json`,
        price_usd:`${base_url.market}/v2/prices/USD.json`,
        buy:`${base_url.market}/v2/buy?key=${process.env.MARKET_KEY}`,
        buy_for:`${base_url.market}/v2/buy-for?key=${process.env.MARKET_KEY}&${process.env.RECIVER_STEAM}`,
        sell:`${base_url.market}/v2/add-to-sale?key=${process.env.MARKET_KEY}`,
        sell_remove_all:`${base_url.market}/v2/remove-all-from-sale?key=${process.env.MARKET_KEY}`,
        balance:`${base_url.market}/v2/get-money?key=${process.env.MARKET_KEY}`
    },
    csgo_buy:{
        order_usd:`${base_url.csgo_buy}/v2/prices/orders/USD.json`,
        price_usd:`${base_url.csgo_buy}/v2/prices/USD.json`,
        order_cny:`${base_url.csgo_buy}/v2/prices/orders/CNY.json`,
        price_cny:`${base_url.csgo_buy}/v2/prices/CNY.json`,
        buy:`${base_url.csgo_buy}/v2/buy?key=${process.env.MARKET_KEY}`,
        buy_for:`${base_url.csgo_buy}/v2/buy-for?key=${process.env.MARKET_KEY}&${process.env.RECIVER_STEAM}`,
        sell:`${base_url.csgo_buy}/v2/add-to-sale?key=${process.env.MARKET_KEY}`,
        sell_remove_all:`${base_url.csgo_buy}/v2/remove-all-from-sale?key=${process.env.MARKET_KEY}`,
        balance:`${base_url.csgo_buy}/v2/get-money?key=${process.env.MARKET_KEY}`
    },
    cs_money:{
        price:`${base_url.cs_money}/2.0/market/sell-orders?limit=60&offset=0&name=`,
    },
    lis_skin:{
        price:`${base_url.lis_skin}/v1/market/search?game=csgo&names%5B%5D=`,
    }
}
async function buff_price(id,cookies) {
    var options = {
        'method': 'GET',
        'url': router.buff.price+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}

async function buff_buy_order(id,cookies) {
    var options = {
        'method': 'GET',
        'url': router.buff.buy_order+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}


async function igxe_price(id,cookies) {
    var options = {
        'method': 'GET',
        'url': router.igxe.price+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}

async function igxe_buy_order(id,cookies) {
    var options = {
        'method': 'GET',
        'url': router.igxe.buy_order+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}

async function market_price_usd() {
    var options = {
        'method': 'GET',
        'url': router.market.price_usd,
    };
    return doRequest(options);
}

async function market_order_usd() {
    var options = {
        'method': 'GET',
        'url': router.market.order_usd,
    };
    return doRequest(options);
}


async function market_buy(name,price)
{
    var options = {
        'method': 'GET',
        'url': encodeURI(router.market.buy+`&hash_name=${name}&price=${price}`),
    };
    return doRequest(options);
}

async function market_sell(id,price)
{
    var options = {
        'method': 'GET',
        'url': encodeURI(router.market.sell+`&id=${name}&price=${price}&cur=USD`),
    };
    return doRequest(options);
}

async function market_remove_all(id,price)
{
    var options = {
        'method': 'GET',
        'url': encodeURI(router.market.sell_remove_all),
    };
    return doRequest(options);
}
async function market_balance(name,price)
{
    var options = {
        'method': 'GET',
        'url': encodeURI(router.market.balance),
    };
    return doRequest(options);
}

async function csgo_buy_price_cny() {
    var options = {
        'method': 'GET',
        'url': router.csgo_buy.price_cny,
    };
    return doRequest(options);
}

async function csgo_buy_order_cny() {
    var options = {
        'method': 'GET',
        'url': router.csgo_buy.order_cny,
    };
    return doRequest(options);
}

async function cs_money_price(name) {
    var options = {
        'method': 'GET',
        "redirect": "follow",
        'url': encodeURI(router.cs_money.price+name),
    };
    // console.log(options)
    return doRequest(options);
}
async function lis_skin_price(name,token) {
    var options = {
        'method': 'GET',
        "redirect": "follow",
        'url': router.lis_skin.price+name,
        'headers': {
                'Authorization': `Bearer ${token}`
        },
    };
    // console.log(options)
    return doRequest(options);
}


async function getIP()
{
    var options = {
        'method': 'GET',
        'url': "https://ifconfig.me",
    };
    // console.log(options)
    return doRequest(options);
}
module.exports = {
    getIP,

    //Market.csgo interfaces : 
    market_buy,
    market_sell,
    market_remove_all,
    market_balance,
    market_price_usd,
    market_order_usd,

    //BUFF interfaces :
    buff_price,
    buff_buy_order,

    //IGXE interfaces :
    igxe_price,
    igxe_buy_order,

    //CSGO BUY
    csgo_buy_price_cny,
    csgo_buy_order_cny,
    cs_money_price,
    lis_skin_price
}