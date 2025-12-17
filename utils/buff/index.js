
const api =require("../request")
const cfg = require("../../config/config.json")
const db = require("../../db/db")
let cookies = {}
async function taker(cases)
{
    const cny_price = await api.buff_buy_order(cases.item_id,cookies)
    if(cny_price && cny_price?.data && cny_price.data?.items && cny_price.data.items[0])
        {
            return cny_price.data.items[0].price
        }
   return 0 ;
}

async function maker(cases)
{
    const cny_price = await api.buff_price(cases.item_id,cookies)
    if(cny_price && cny_price?.data && cny_price.data?.items &&cny_price.data.items[0])
        {
            return cny_price.data.items[0].price
        }
   return 0 ;
}

async function price(cases) {
  cookies = (await db.getMinerAuth({type:"buff_cookies"}))[0].data
  return {
    taker: (await taker(cases))/cfg.usdtocny,
    maker: (await maker(cases))/cfg.usdtocny
  }
}
module.exports = {
  taker,
  maker,
  price
}