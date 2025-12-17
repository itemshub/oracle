const db = require("../db/db")

const buff_class  = require("../class/buff/index");
const igxe_class = require("../class/igxe/index");
const uupy_class = require("../class/uuyp/index")
const c5_class = require("../class/c5/index");
const market_csgo_class = require("../class/market_csgo/index");
const steam_class = require("../class/steam/index")
const csgo_buy_class = require("../class/csgo_buy");
const lis_skin_class = require("../class/lis_skin");
const classes = {
    buff163 : buff_class,
    igxe : igxe_class,
    uuyp : uupy_class,
    c5 : c5_class,
    csgo_market : market_csgo_class,
    csgo_buy : csgo_buy_class,
    lis_skin : lis_skin_class
}
const amm_market = require("../config/market_amm.json");
const auth = require("./middleware/auth");


const account_information = async () => {
  try {
    // 1️⃣ 并行获取所有认证信息
    const [
      buff163Res,
      igxeRes,
      uuypRes,
      c5Res,
      csgoMarketRes,
      csgoBuyRes,
      LisSkinRes
    ] = await Promise.all([
      db.getMinerAuth({ type: "buff_cookies" }),
      db.getMinerAuth({ type: "igxe_cookies" }),
      db.getMinerAuth({ type: "uuyp_cookies" }),
      db.getMinerAuth({ type: "c5_key" }),
      db.getMinerAuth({ type: "market_csgo_key" }),
      db.getMinerAuth({ type: "csgo_buy_key" }),
      db.getMinerAuth({ type: "lis_skin_apikey" }),
    ]);

    const cookie = {
      buff163: buff163Res?.[0]?.data,
      igxe: igxeRes?.[0]?.data,
      uuyp: uuypRes?.[0]?.data,
      c5: c5Res?.[0]?.data,
      csgo_market: csgoMarketRes?.[0]?.data,
      csgo_buy: csgoBuyRes?.[0]?.data,
      lis_skin: LisSkinRes?.[0]?.data,
    };

    // 2️⃣ 并行获取所有 market balance
    const balance = await Promise.all(
      amm_market.map(async (i) => {
        try{
          if(classes?.[i.market_id])
          {
            const obj = new classes[i.market_id]({
              cookie: cookie[i.market_id],
            });
            const bal = await obj.balance();
            return {
              name: i.name,
              market_id: i.market_id,
              img_url: i.img_url,
              balance: {
                raw: bal,
              },
            };
          }else{
            return {
              name: i.name,
              market_id: i.market_id,
              img_url: i.img_url,
              balance: {
                raw: 0,
              },
            };
          }
        }catch(e)
        {
            return {
              name: i.name,
              market_id: i.market_id,
              img_url: i.img_url,
              balance: {
                raw: 0,
              },
            };
        }
      }
    )
    );

    return balance;
  } catch (e) {
    console.error(e);
    return [];
  }
};

const account_inventory = async () => {
  try {
    const steam = new steam_class(
        {
            tradeUrl:(await db.getMinerAuth({type:"steam_url"}))[0]?.data
        }
    )
    const inventory = await steam.getInventory()
    return inventory;
  } catch (e) {
    console.error(e);
    return [];
  }
};

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
    user_login_email,
    account_inventory
}