
const api =require("../request")
const cfg = require("../../config/config.json")
const db = require("../../db/db")
let cookies = {}
async function taker(cases)
{
    const cny_price = await api.igxe_buy_order(cases.igxe_id,cookies)
    if(cny_price?.datas && cny_price.datas?.datas && cny_price.datas.datas?.length >0)
        {
            return Number(cny_price.datas.datas[0].unit_price)
        }
   return 0 ;
}

async function maker(cases)
{
    const cny_price = await api.igxe_price(cases.igxe_id,cookies)
    if(cny_price?.d_list && cny_price.d_list?.length >0)
        {
            return Number(cny_price.d_list[0].unit_price)
        }
   return 0 ;
}

async function price(cases) {
  cookies = (await db.getMinerAuth({type:"igxe_cookies"}))[0].data
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