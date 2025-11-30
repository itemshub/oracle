const csskin_gg = require("../utils/csskin_gg")
const { sleep } = require("../utils/utils")
const init = async ()=>
{
    while(true)
    {
        await loope();
        await sleep(600000)
    }
}

const loope = async ()=>
{
    try{
        await csskin_gg.fetchMarketData();
        await sleep(300000)
        await csskin_gg.fetchSkinData();
        await sleep(300000)
    }catch(e)
    {
        console.error(e)
    }
}

init()