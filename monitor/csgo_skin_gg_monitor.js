const csskin_gg = require("../utils/csskin_gg")
const { sleep } = require("../utils/utils")
const init = async ()=>
{
    // while(true)
    // {
    //     await loope();
    //     await sleep(600000)
    // }

    console.log("🍺 Start csskin fetch now : ",(new Date()).toLocaleString())
    await csskin_gg.fetchSkinData();
    console.log("💀 End csskin fetch now : ",(new Date()).toLocaleString())
    process.exit(0)
}

const loope = async ()=>
{
    // await csskin_gg.fetchMarketData();
    // await sleep(60000)
    try{
        await csskin_gg.fetchSkinData();
        await sleep(3600000)
    }catch(e)
    {
        console.error(e)
    }
}

init()