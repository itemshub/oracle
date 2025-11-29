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
const cases = require("./config/case.json")
const markets = require("./config/market.json")