const path = require('path');
//Chrome
const puppeteer = require("puppeteer-core");
const { MongoTable } = require("./db/db")
const tables = {
    skins: new MongoTable("skins"),
    skins_batch: new MongoTable("skins_batch"),
    markets: new MongoTable("markets"),
    markets_batch: new MongoTable("markets_batch"),
};
const express = require('express');
var bodyParser = require('body-parser');
var querystring = require('querystring');
const { getLatestMarketData, getLatestSkinData, index, arbi, cn_index } = require('./controller');
const app = express();
const PORT = 7749;
const cases = require("./config/case.json")
const markets = require("./config/market.json");
const markets_amm = require("./config/market_amm.json")
const cors = require('cors');
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server Error');
});


async function sendSuccess(res, data) {
    if (!data) {
        data = "success"
    }
    return await res.status(200).send({
        "code": 200,
        "data": data
    })
}

async function sendErr(res, err) {
    if (!err) {
        err = "unknow error"
    }
    return await res.status(500).send({
        "code": 500,
        "error": err
    })
}


app.get('/ping', async function(req, res) {
    return sendSuccess(res)
})

app.get('/case', async function(req, res) {
  return sendSuccess(res, cases);
});


app.get('/market/lts', async function(req, res) {
  const datas = await getLatestMarketData();
  return sendSuccess(res, datas);
});

app.get('/skin/lts', async function(req, res) {
  const datas = await getLatestSkinData();
  return sendSuccess(res, datas);
});

app.get('/index', async function(req, res) {
  const ret = await index();
  return sendSuccess(res, ret);
});

app.get('/index/cn', async function(req, res) {
  const ret = await cn_index();
  return sendSuccess(res, ret);
});
app.get('/arbi', async function(req, res) {
  const ret = await arbi();
  return sendSuccess(res, ret);
});
app.get('/amm', async function(req, res) {
  const ret = await arbi();
  return sendSuccess(res, ret);
});
app.get('/amm/markets', async function(req, res) {
  const ret = markets_amm;
  return sendSuccess(res, ret);
});


app.listen(PORT, () => {
  console.log(`🚀 API RUN NOW: http://localhost:${PORT}`);
});
