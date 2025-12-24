
const api =require("../request")
async function taker(cases)
{
    const cny_price = await api.market_order_usd(cases.item_id)
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
    const cny_price = await api.market_price_usd(cases.item_id)
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
    taker: 0,// await taker(cases),
    maker: await maker(cases)
  }
}
module.exports = {
  taker,
  maker,
  price
}