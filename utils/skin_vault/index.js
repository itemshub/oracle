
const api =require("../request")
async function taker(cases)
{
   return 0 ;
}

async function maker(cases)
{
    const cny_price = await api.skin_vault_market_price()
    for(let i of cny_price?.items?Object.values(cny_price.items) :[])
    {
        if(cases.name == i?.market_hash_name)
            {
                return Number(i.buy_price)
            }
    }
   return 0 ;
}

async function price(cases) {
  return {
    taker: await taker(cases)/100,
    maker: await maker(cases)/100
  }
}
module.exports = {
  taker,
  maker,
  price
}