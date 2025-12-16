const {sleep} = require("../utils/utils")
const db = require("../db/db")
const buff_class = require("../class/buff/index");
const igxe_class = require("../class/igxe/index");
const uupy_class = require("../class/uuyp/index")
const loop = async () =>
{
    const buff = (await db.getMinerAuth({type:"buff_cookies"}))[0]?.data
    const igxe = (await db.getMinerAuth({type:"igxe_cookies"}))[0]?.data
    const uuyp = (await db.getMinerAuth({type:"uuyp_cookies"}))[0]?.data

    const _buff = new buff_class(
        {
            cookie:buff
        }
    );
    const _igxe = new igxe_class(
        {
            cookie:igxe
        }
    )
    const _uuyp = new uupy_class(
        {
            cookie:uuyp
        }
    )

    try{
        const buff_bal = await _buff.balance();
        const igxe_bal = await _igxe.balance();
        const uuyp_bal = await _uuyp.balance();
        
        console.log(`⚙ ${buff_bal} : ${igxe_bal} : ${uuyp_bal}`)
        if(!buff_bal || !igxe_bal || !uuyp_bal)
        {
            console.log("❌ Auth failed")
            process.exit(0)
        }
    }catch(e)
    {
        console.log("❌ Auth failed :",e)
        process.exit(0)
    }

}
const check_auth = async () =>
{
    while(true)
    {
        await loop();
        await sleep(3600000)
    }
}

check_auth()