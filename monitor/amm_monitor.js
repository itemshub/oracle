
const { sleep } = require("../utils/utils")
const cases = require("../config/case.json")


const buff = require("../utils/buff/index")
const csgo_market = require("../utils/csgo_market/index")
const c5 = require("../utils/c5/index")
const uuyp = require("../utils/uupy/index")
const igxe = require("../utils/igxe/index")
const csgo_buy = require("../utils/csgo_buy/index")
const cs_money = require("../utils/cs_money/index")
const lis_skin = require("../utils/lis_skin/index")
const exeskins = require("../utils/exeskins/index")

const { MongoTable } = require('../db/db');
const tables = {
    amm: new MongoTable("amm"),
    amm_batch: new MongoTable("amm_batch"),
};

const loop = async()=>
{

            const batchId = 0;

            await tables.amm_batch.insert({
                id: batchId,
                startTime: Date.now(),
                endTime: 0,
                status: 0
            });

            for(let i of cases)
            {
                try{
                    const amm = {
                        batchId,
                        skinId:i.id,
                        name:i.name,
                        timestamp:Date.now(),
                        data:{
                            buff163:await buff.price(i),
                            igxe:await igxe.price(i),
                            csgo_market:await csgo_market.price(i),
                            csgo_buy : await csgo_buy.price(i),
                            lis_skin : await lis_skin.price(i),
                            uuyp:await uuyp.price(i),
                            c5:await c5.price(i),
                            exeskins:await exeskins.price(i)
                            // cs_money : await cs_money.price(i)
                        }
                    }
                    await tables.amm.insert(amm)
                    }catch(e)
                    {
                        console.error(e)
                    }
                await sleep(60000)
            }

            await tables.amm_batch.update(
                { id: batchId },
                { $set: { endTime: Date.now(), status: 1 } },
                { multi: false }
            );
            
        return true;
}

const init = async()=>
{
    // while(true)
    // {
    //     await loop()
    //     await sleep(3600000)
    // }
    console.log("🍺 Start amm now : ",(new Date()).toLocaleString())
    await loop()
    console.log("💀 End amm now : ",(new Date()).toLocaleString())
    process.exit(0)
}

init()