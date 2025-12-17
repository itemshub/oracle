
const api =require("../request")
const cfg = require("../../config/config.json")
async function taker(cases)
{
    const cny_price = await api.csgo_buy_order_cny(cases.item_id)
    for(let i of cny_price?.items?cny_price.items :[])
    {
        if(cases.name == i?.market_hash_name)
            {
                return i.price
            }
    }
   return 0 ;
}

async function maker(cases)
{
    const cny_price = await api.csgo_buy_price_cny(cases.item_id)
    for(let i of cny_price?.items?cny_price.items :[])
    {
        if(cases.name == i?.market_hash_name)
            {
                return Number(i.price)
            }
    }
   return 0 ;
}

async function price(cases) {
  return {
    taker: 0,// (await taker(cases))/cfg.usdtocny,
    maker: (await maker(cases))/cfg.usdtocny
  }
}
module.exports = {
  taker,
  maker,
  price
}