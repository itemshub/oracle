const csskin_gg = require("./utils/csskin_gg")

const db =require("./db/db")
const test = async ()=>
{
    // await csskin_gg.fetchSkinData()
    await db.newAnnouncement(
        "平台构建中",
        "Itemshub 饰集小程序即将完成构建。TARO真不是人用的玩意儿。"
    )
}

test()