const csskin_gg = require("./utils/csskin_gg")

const db =require("./db/db")

const markets = require("./config/market.json")

const test = async ()=>
{
    // await csskin_gg.fetchSkinData()
    // await db.newAnnouncement(
    //     "平台构建中",
    //     "Itemshub 饰集小程序即将完成构建。TARO真不是人用的玩意儿。"
    // )

    for(let i of markets)
    {
        console.log(
            `wget ${i.logo_url}`
        )
    }
}

test()