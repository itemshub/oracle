
const api =require("../request")
const cfg = require("../../config/config.json")
const db = require("../../db/db")
let cookies = {}
async function taker(cases)
{
   return 0 ;
}

async function maker(cases)
{
    const cny_price = await api.lis_skin_price(cases.name,cookies)
    if(cny_price && cny_price?.data && cny_price.data?.length > 0 )
    {
      for(let i of cny_price?.data?cny_price.data :[])
      {
          if(cases.name == i?.name)
              {
                  return Number(i.price)
              }
      }
    }
   return 0 ;
}

async function price(cases) {
  cookies = (await db.getMinerAuth({type:"lis_skin_apikey"}))[0].data
  return {
    taker: 0,// (await taker(cases))/cfg.usdtocny,
    maker: (await maker(cases))
  }
}
module.exports = {
  taker,
  maker,
  price
}