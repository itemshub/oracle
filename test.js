const csskin_gg = require("./utils/csskin_gg")

const db =require("./db/db")

const markets = require("./config/market.json")

const cases = require("./config/case.json")

const igxeId = require("./utils/igxe/igxe.json")

const buff = require("./utils/buff/index")
const csgo_market = require("./utils/csgo_market/index")
const c5 = require("./utils/c5/index")
const uuyp = require("./utils/uupy/index")
const igxe = require("./utils/igxe/index")
const csgo_buy = require("./utils/csgo_buy/index")
const cs_money = require("./utils/cs_money/index")
const lis_skin = require("./utils/lis_skin/index")
const skin_vault = require("./utils/skin_vault/index")
const exeskins = require("./utils/exeskins/index")

const uuyp_update_auth = require("./utils/uupy/auth_update")
const buff_update_auth = require("./utils/buff/auth_update")


const steam_class = require("./class/steam/index")

const { request_analyze } = require("./chrome_script/request_analizer")
const test = async ()=>
{
    // await csskin_gg.fetchSkinData()
    // await db.newAnnouncement(
    //     "平台构建中",
    //     "Itemshub 饰集小程序即将完成构建。TARO真不是人用的玩意儿。"
    // )

    // for(let i of markets)
    // {
    //     let logo = i.logo_url.split("/")
    //     i.logo_url = `https://itemshub-res.sidcloud.cn/markets/${logo[logo.length-1]}`
    // }
    // console.log(JSON.stringify(markets))
    // for(let i of cases)
    // {
    //     // i['item_id'] = buff[i.name]? buff[i.name] : 0
    //     // if(!i?.c5_id)
    //     // {
    //     //     i['c5_id'] = 100000000
    //     // }

    //     // if(!i?.uuyp_id)
    //     // {
    //     //     i['uuyp_id'] = 100000000
    //     // }

    //     // i['igxe_id'] = igxeId[i.name]? igxeId[i.name] : 0
    //     i.name = `${i.name} 特别款实体贴纸`
    //     i.img_url = "http://itemshub-res.sidcloud.cn/sticker.png"
    // }
    // console.log(JSON.stringify(cases))

    // console.log(await buff.price(cases[0]))

    // console.log(await csgo_market.price(cases[0]))

    // console.log(await c5.price(cases[0]))

    // console.log(await uuyp.price(cases[0]))

    // console.log(await igxe.price(cases[0]))

    // await uuyp_update_auth.auth_update()
    // await buff_update_auth.auth_update()
    // console.log(
    //     await cs_money.price(cases[0])
    // )
    // console.log(
    //     await lis_skin.price(cases[0])
    // )

    // console.log(
    //     await skin_vault.price(cases[0])
    // )

    // await request_analyze("https://exeskins.com/?search=glove+case&sortBy=price&direction=asc")


    // console.log(
    //     await exeskins.price(cases[0])
    // )

    const steam = new steam_class(
        {
            tradeUrl:(await db.getMinerAuth({type:"steam_url"}))[0]?.data
        }
    )
    const inventory = await steam.getInventory()
    console.log(inventory)
}

// const b58 = require("b58")
// const crypto = require('crypto');
// function md5(str) {
//   return crypto.createHash('md5').update(String(str), 'utf8').digest('hex');
// }

// const c5_class = require("./class/c5/index")
// const market_csgo_class = require("./class/market_csgo/index")
// const igxe_class = require("./class/igxe");
// const buff_class = require("./class/buff/index")
// const uupy_class = require("./class/uuyp/index")
// const db = require("./db/db")
// const test = async ()=>
// { 

//     process.exit(0)
// }

test()