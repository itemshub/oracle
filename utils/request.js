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
    igxe:"https://www.igxe.cn"
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
        price_usd:`${base_url.market}/v2/prices/USD.json`,
        buy:`${base_url.market}/v2/buy?key=${process.env.MARKET_KEY}`,
        buy_for:`${base_url.market}/v2/buy-for?key=${process.env.MARKET_KEY}&${process.env.RECIVER_STEAM}`,
        sell:`${base_url.market}/v2/add-to-sale?key=${process.env.MARKET_KEY}`,
        sell_remove_all:`${base_url.market}/v2/remove-all-from-sale?key=${process.env.MARKET_KEY}`,
        balance:`${base_url.market}/v2/get-money?key=${process.env.MARKET_KEY}`
    }
}
async function buff_price(id) {
    var options = {
        'method': 'GET',
        'url': router.buff.price+id,
    };
    return doRequest(options);
}

async function buff_buy_order(id) {
    var options = {
        'method': 'GET',
        'url': router.buff.buy_order+id,
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
}