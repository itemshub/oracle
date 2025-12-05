const { MongoTable,getAnnouncement } = require("../db/db")
const mk = require("../config/market.json")
const tables = {
    skins: new MongoTable("skins"),
    skins_batch: new MongoTable("skins_batch"),
    markets: new MongoTable("markets"),
    markets_batch: new MongoTable("markets_batch"),
};
async function getLatestMarketData() {
  const latest = await tables.markets_batch.find({});
  latest.sort((a, b) => b.id - a.id);
  const top2 = latest.slice(0, 2);
  if (top2.length < 2) return [];
  const _batchId = top2[1].id;
  const sameBatchData = await tables.markets.find({ id: _batchId });
  sameBatchData.sort((a, b) => a.timestamp - b.timestamp);
  return sameBatchData;
}

async function getLatestSkinData() {
  const latest = await tables.skins_batch.find({});
  latest.sort((a, b) => b.id - a.id);
  const top2 = latest.slice(0, 2);
  if (top2.length < 2) {
    if(top2.length < 1)
    {
        return []
    }
  };
  const _batchId =top2.length>1 ?  top2[1].id : top2[0].id;
  const sameBatchData = await tables.skins.find({ id: _batchId });
  sameBatchData.sort((a, b) => a.timestamp - b.timestamp);
  return sameBatchData;
}
async function getAnnounce() {
  return await getAnnouncement();
}

async function index() {
  let skins = await getLatestSkinData()
  for(let i of skins)
  {
    i["data"] = i.data.filter(item => item.active_offers >= 500).filter(item => item.name.toLowerCase() !== "steam").sort((a, b) => a.price - b.price);
  }
  let markets = await getLatestMarketData();
  markets = markets.filter(item => item.seller_fee!=null)
  const announce = await getAnnounce();
  let lastUpdateTime = skins?.length >0 ? skins[0].timestamp : Date.now();

  let topSkinSub = [];
  let skinsAverageSub = 0;
  let greatProfit = 0;
  let profitRate  = 0;
  //Culcuate average price 
  for(let i of skins)
  {
    let totalPrice = 0;
    let totalOffer = 0;
    let averageSub = i.data?.length>1 ? (i.data[i.data.length-1].price - i.data[0].price) / i.data[0].price :0
    if(averageSub > 0.25)
    {
      greatProfit+=1;
    }
    skinsAverageSub+=averageSub
    if(averageSub>0.25)
    {
      topSkinSub.push(
        {
          skin:i,
          from:i.data[0],
          to:i.data[i.data.length-1]
        }
      )
    }
    for(let u of i.data)
    {
      totalPrice+=u.price;
      totalOffer+=u.active_offers;
    }
    i['averageSub'] = averageSub;
    i['price'] = totalPrice/i.data?.length;
    i['offers'] = totalOffer/i.data?.length;
  }

  for(let i of markets)
  {
    for(let u of mk)
    {
      if(i.name.toLowerCase() == u.name.toLocaleLowerCase())
      {
        //Market information merge
        i['img_url'] = u.logo_url;
        i['avg_discount'] = Number((u.avg_discount.split("%")[0])) ? Number((u.avg_discount.split("%")[0]))  : 0;
        i['offers'] = u.offers;
        i['items'] = u.items;
        i['value'] = u.value;
        i['visits'] = u.visits;
      }
    }
  }
  profitRate = skinsAverageSub;
  skinsAverageSub = skinsAverageSub/skins.length;

  return{
    greatProfit,
    profitRate,
    skinsAverageSub,
    skins,
    markets,
    topSkinSub,
    announce,
    lastUpdateTime
  }
}

module.exports = {
    getLatestMarketData,
    getLatestSkinData,
    index
}