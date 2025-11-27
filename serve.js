const path = require('path');
//Chrome
const puppeteer = require("puppeteer-core");
const Datastore = require('@seald-io/nedb')
const db_base = "./db/"
let batchId = 0;
const dbs = {
    skins : db_base+"skins",
    skins_batch : db_base+"skins_batch",
    markets : db_base+"markets",
    markets_batch : db_base+"markets_batch",
}
const tables = {
    skins:new Datastore({ filename: dbs.skins, autoload: true }),
    skins_batch:new Datastore({ filename: dbs.skins_batch, autoload: true }),
    markets:new Datastore({ filename: dbs.markets, autoload: true }),
    markets_batch:new Datastore({ filename: dbs.markets_batch, autoload: true }),
}
const cases = require("./config/case.json")
const markets = require("./config/market.json")