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
const router = {
    buff:{
        price:"https://buff.163.com/api/market/goods/sell_order?game=csgo&page_num=1&sort_by=default&mode=&allow_tradable_cooldown=1&goods_id=",
        buy_order:"https://buff.163.com/api/market/goods/buy_order?game=csgo&page_num=1&goods_id="
    },
    igxe:{
        price:"https://www.igxe.cn/product/trade/730/",
        buy_order:"https://www.igxe.cn/purchase/get_product_purchases?product_id="
    },
    market:{
        order_usd:"https://market.csgo.com/api/v2/prices/orders/USD.json",
        price_usd:"https://market.csgo.com/api/v2/prices/USD.json",
        buy:`https://market.csgo.com/api/v2/buy-for?key=${process.env.MARKET_KEY}&${process.env.RECIVER_STEAM}`
    }
}
const cookies =process.env.COOKIES
async function buff_price(id) {
    var options = {
        'method': 'GET',
        'url': router.buff.price+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}

async function buff_buy_order(id) {
    var options = {
        'method': 'GET',
        'url': router.buff.buy_order+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}


async function igxe_price(id) {
    var options = {
        'method': 'GET',
        'url': router.igxe.price+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}

async function igxe_buy_order(id) {
    var options = {
        'method': 'GET',
        'url': router.igxe.buy_order+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}


async function uuyp_price(id) {
    var options = {
        'method': 'GET',
        'url': router.uuyp.price+id,
        'headers': {
            'Cookie': cookies
        },
    };
    return doRequest(options);
}

async function uuyp_buy_order(id) {
    var options = {
        'method': 'GET',
        'url': router.uuyp.buy_order+id,
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
    // console.log(router.market.buy)
    var options = {
        'method': 'GET',
        'url': encodeURI(router.market.buy+`&hash_name=${name}&price=${price}`),
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
    buff_price,
    buff_buy_order,
    igxe_price,
    igxe_buy_order,
    uuyp_price,
    uuyp_buy_order,
    market_price_usd,
    market_order_usd,
    market_buy,
    getIP
}