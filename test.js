const csskin_gg = require("./utils/csskin_gg")

// const db =require("./db/db")

const markets = require("./config/market.json")

const cases = require("./config/case.json")

const buff = require("./utils/buff/index")
const csgo_market = require("./utils/csgo_market/index")
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
    //     i['item_id'] = buff[i.name]? buff[i.name] : 0
    // }
    // console.log(JSON.stringify(cases))

    console.log(await buff.price(cases[10]))

    console.log(await csgo_market.price(cases[10]))

}

test()