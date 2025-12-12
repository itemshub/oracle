const { MongoTable,getAnnouncement } = require("../db/db")
const mk = require("../config/market.json")
const mk_cn = require("../config/market_cn.json")
const cases = require("../config/case.json")

const cn_mk = require("../config/cn/market.json")
const cn_mk_cn = require("../config/cn/market_cn.json")
const cn_cases = require("../config/cn/case.json")

const tables = {
    skins: new MongoTable("skins"),
    skins_batch: new MongoTable("skins_batch"),
    markets: new MongoTable("markets"),
    markets_batch: new MongoTable("markets_batch"),
    amm: new MongoTable("amm"),
};
async function getLatestMarketData() {
  const latest = await tables.markets_batch.find({
    status:1
  });
  latest.sort((a, b) => b.id - a.id);
  const top2 = latest.slice(0, 2);
  if (top2.length < 2) return [];
  const _batchId = top2[1].id;
  const sameBatchData = await tables.markets.find({ id: _batchId });
  sameBatchData.sort((a, b) => a.timestamp - b.timestamp);
  return sameBatchData;
}

async function getLatestSkinData() {
  const latest = await tables.skins_batch.find({
    status:1
  });
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

  // const whitelist = [
  //   "BUFF163",
  //   "IGXE",
  //   "悠悠有品",
  //   "C5"
  // ]

  for(let i of skins)
  {
    const ad =await (await tables.amm.col()).find({ skinId : i.skin }).sort({ timestamp: -1 }).limit(1).project({ _id: 0 }).toArray();
    for(let u of mk_cn)
    {
      let m = JSON.parse(JSON.stringify(u));
      m['active_offers'] = 1600
      if(ad?.length > 0 && ad[0].data )
      {
        // console.log(ad[0].data)
        if(u.name == "IGXE")
        {
          m['price'] = Number(ad[0].data.igxe?.maker);
        }
        if(u.name == "悠悠有品")
        {
          m['price'] = Number(ad[0].data.uuyp?.maker);
        }
        if(u.name == "C5")
        {
          m['price'] = Number(ad[0].data.c5?.maker);
        }
      }else{
         m['price'] = 0;
      }
      
      m['offer_url'] = "https://csgoskins.gg/redirects/78167793104?s=1&p=20&h=5fc43fdfd8906b0b"
      m['promoted'] = false
      i.data.push(m)
    }
    for(let u of i.data)
    {
      if (u.name == "BUFF163")
      {
        if(ad?.length > 0 && ad[0].data )
        {
          u['price'] = Number(ad[0].data.buff163?.maker);
        }
      }
    }

    i["data"] = i.data.filter(item => Number(item.price) >0).filter(item => item.active_offers >= 500).filter(item => item.name.toLowerCase() !== "steam").sort((a, b) => a.price - b.price)
    // .filter(item =>item.name != null && whitelist.includes(item.name));
    //TODO concat real data.
  }
  let markets = await getLatestMarketData();
  markets = markets.filter(item => item.seller_fee!=null)
  // .filter(item =>item.name != null && whitelist.includes(item.name));
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
  markets = markets.concat(mk_cn)
  profitRate = skinsAverageSub;
  skinsAverageSub = skinsAverageSub/skins.length;
  skins = skins.filter(item => item.offers >= 0).filter(item => item.price >= 0);
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

async function cn_index() {
  let skins = await getLatestSkinData()

  const whitelist = [
    "BUFF163的淘宝小店",
    "京东商城【IGXE店】",
    "悠悠有品淘宝小店",
    "京东商城【C5小店】"
  ]

  for(let i of skins)
  {
    for(let u of cn_cases)
    {
      if(u.id == i.skin)
      {
        i.name = u.name;
        i.img_url = u.img_url;
      }
    }

    const ad =await (await tables.amm.col()).find({ skinId : i.skin }).sort({ timestamp: -1 }).limit(1).project({ _id: 0 }).toArray();
    for(let u of cn_mk_cn)
    {
      let m = JSON.parse(JSON.stringify(u));
      m['active_offers'] = 1600
      if(ad?.length > 0 && ad[0].data )
      {
        // console.log(ad[0].data)
        if(u.name == "京东商城【IGXE店】")
        {
          m['price'] = Number(ad[0].data.igxe?.maker);
        }
        if(u.name == "悠悠有品淘宝小店")
        {
          m['price'] = Number(ad[0].data.uuyp?.maker);
        }
        if(u.name == "京东商城【C5小店】")
        {
          m['price'] = Number(ad[0].data.c5?.maker);
        }
      }else{
         m['price'] = 0;
      }
      
      m['offer_url'] = "https://csgoskins.gg/redirects/78167793104?s=1&p=20&h=5fc43fdfd8906b0b"
      m['promoted'] = false
      i.data.push(m)
    }
    for(let u of i.data)
    {
      if (u.name == "BUFF163")
      {
        if(ad?.length > 0 && ad[0].data )
        {
          u['price'] = Number(ad[0].data.buff163?.maker);
          u['name'] = "BUFF163的淘宝小店"
        }
      }
    }

    i["data"] = i.data.filter(item => Number(item.price) >0).filter(item => item.active_offers >= 500).filter(item => item.name.toLowerCase() !== "steam").sort((a, b) => a.price - b.price).filter(item =>item.name != null && whitelist.includes(item.name));
    //TODO concat real data.
  }
  let markets = await getLatestMarketData();
  markets = markets.filter(item => item.seller_fee!=null).filter(item =>item.name != null && whitelist.includes(item.name));
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
    for(let u of cn_mk)
    {
      if(i.name.toLowerCase() == u.name.toLocaleLowerCase())
      {
        //Market information merge
        i['name'] = u.name;
        i['img_url'] = u.logo_url;
        i['avg_discount'] = Number((u.avg_discount.split("%")[0])) ? Number((u.avg_discount.split("%")[0]))  : 0;
        i['offers'] = u.offers;
        i['items'] = u.items;
        i['value'] = u.value;
        i['visits'] = u.visits;
      }
    }
  }
  markets = markets.concat(cn_mk_cn)
  profitRate = skinsAverageSub;
  skinsAverageSub = skinsAverageSub/skins.length;
  skins = skins.filter(item => item.offers >= 0).filter(item => item.price >= 0);
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

async function arbi() {
  let ret = [];
  for(let i of cases)
  {
    let amm =await (await tables.amm.col()).find({ skinId : i.id }).sort({ timestamp: -1 }).limit(1).project({ _id: 0 }).toArray();
    // console.log(amm)
    if(amm.length > 0)
    {
      amm = amm[0];
      const mks = Object.keys(amm?.data);
      let arb =[];
      for(let u of mks)
      {
        for(y of mks)
        {
          if(u!=y && amm.data[u].maker >0&& amm.data[y].maker >0 && amm.data[u].maker > amm.data[y].maker )
          {

            arb.push(
              {
                from:u,
                to:y,
                sub:amm.data[u].maker - amm.data[y].maker,
                rate : (amm.data[u].maker-amm.data[y].maker)/amm.data[y].maker
              }
            )
          }
        }
      }

      arb = arb.sort((a, b) => b.rate - a.rate)
      let arb_ret = {
        name:i.name,
        id:i.id,
        skin:i,
        max_arb_rate:arb?.length> 0 ? arb[0].rate : 0,
        raw:amm,
        arb
      }
      ret.push(arb_ret)
    }
  }
  return ret
}
module.exports = {
    getLatestMarketData,
    getLatestSkinData,
    index,
    arbi,
    cn_index
}