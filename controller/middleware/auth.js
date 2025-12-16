const uuid = require('uuid');
const db = require("../../db/db")
async function auth(req, res, next) {
    const token = req.headers.token;
    const authUser = await db.verfiToken(token);
    if (authUser && authUser?.length>0) {
        res.locals.auth = authUser;
        next();
    } else {
        res.status(401).send({
            code: 401,
            error: "Permission deny . Please check if API-KEY correct ."
        });
    }
}

async function newkey(uid) {
    const key = uuid.v4();
    await db.newAccountToken(key,uid)
    return key;
}

module.exports = {
    auth,
    newkey
}