const { MongoTable } = require("../db/db")
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

module.exports = {
    getLatestMarketData,
    getLatestSkinData
}