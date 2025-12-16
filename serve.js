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

const auth = require("./controller/middleware/auth");
const { user_login_email, account_information } = require('./controller/admin');
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server Error');
});
var logger = require('morgan');
app.use(logger('dev'));
logger.token('time', () => new Date().toISOString());
app.use(
  logger(':time :method :url :status :res[content-length] - :response-time ms')
);

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

/**
 * Base data interfaces
 */

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

/**
 * Admin interfaces
 */
app.get('/admin/ping', auth.auth, async function(req, res) {
    return sendSuccess(res, "Admin pong");
})

app.post('/admin/login', async function(req, res) {
    const ln = await user_login_email(req.body?.email,req.body?.password)
    if(ln)
    {
      return sendSuccess(res,ln)
    }
    return sendErr(res,"Login Failed")
})

app.get('/admin/info', auth.auth, async function(req, res) {
    return sendSuccess(res, await account_information());
})

app.listen(PORT, () => {
  console.log(`🚀 API RUN NOW: http://localhost:${PORT}`);
});
