const db = require("../db/db")

const buff_class  = require("../class/buff/index");
const igxe_class = require("../class/igxe/index");
const uupy_class = require("../class/uuyp/index")
const c5_class = require("../class/c5/index");
const market_csgo_class = require("../class/market_csgo/index");

const classes = {
    buff163 : buff_class,
    igxe : igxe_class,
    uuyp : uupy_class,
    c5 : c5_class,
    csgo_market : market_csgo_class,
}
const amm_market = require("../config/market_amm.json");
const auth = require("./middleware/auth");

const account_information = async ()=>
{
    try{
        const cookie = {
            buff163 : (await db.getMinerAuth({type:"buff_cookies"}))[0]?.data,
            igxe : (await db.getMinerAuth({type:"igxe_cookies"}))[0]?.data,
            uuyp : (await db.getMinerAuth({type:"uuyp_cookies"}))[0]?.data,
            c5 : (await db.getMinerAuth({type:"c5_key"}))[0]?.data,
            csgo_market : (await db.getMinerAuth({type:"market_csgo_key"}))[0]?.data,
        }

        let balance = [];

        for(let i of amm_market)
        {
            const obj = new classes[i.market_id](
                {
                    cookie:cookie[i.market_id]
                }
            )
            let bal = await obj.balance();
            balance.push(
                {
                    name:i.name,
                    market_id:i.market_id,
                    img_url:i.img_url,
                    balance:{
                        raw : bal
                    }
                }
            )
        }

        return balance;
    }catch(e)
    {
        console.error(e);
        return [];
    }
}

const user_login_email = async(email,password)=>
{
    const verfi = await db.verfiPassword(String(email).toLowerCase(),password);
    console.log(verfi);
    if(verfi && verfi?.status)
    {
        return await auth.newkey(verfi.user?.email)
    }
    return false;
}
module.exports = {
    account_information,
    user_login_email
}