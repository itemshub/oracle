const { MongoClient } = require('mongodb');
require('dotenv').config();

const mainConnection = process.env.DB_HOST;
const mainDB = process.env.DB_NAME;

// Collections
const sUser = "users";
const sUserToken = "user_tokens";

const sAnnouncement = "announcement";

const sMinerAuth = "miner_auth"
// --------------------------------------
// Global MongoDB Connection Pool (Singleton)
// --------------------------------------
let cachedClient = null;

async function connect() {
    if (!cachedClient) {
        cachedClient = new MongoClient(mainConnection, { maxPoolSize: 20 });
        await cachedClient.connect();
    }

    const db = cachedClient.db(mainDB);

    return {
        pool: cachedClient,
        db,
        close: async () => {} // 兼容旧代码，但不再真正关闭连接
    };
}

// 工具：快捷获取 collection
async function getCollection(name) {
    const db = await connect();
    return db.db.collection(name);
}

// --------------------------------------
// Helpers
// --------------------------------------

async function safeQuery(fn) {
    try {
        return await fn();
    } catch (err) {
        console.error("DB Error:", err);
        return false;
    }
}

// --------------------------------------
// Accounts
// --------------------------------------

async function newAccount(data) {
    return safeQuery(async () => {
        const acc = await getAccountByEmail(data.email);
        if (acc.length > 0) return false;

        const col = await getCollection(sUser);
        return await col.insertOne(data);
    });
}

async function getAccountByAddress(add) {
    return safeQuery(async () => {
        const col = await getCollection(sUser);
        return await col.find({ address: add }).project({ _id: 0 }).toArray();
    });
}

async function getAccountByWallet(add) {
    return safeQuery(async () => {
        const col = await getCollection(sUser);
        return await col.find({ wallet: add }).project({ _id: 0, password: 0 }).toArray();
    });
}

async function getAccountByEmail(add) {
    return safeQuery(async () => {
        const col = await getCollection(sUser);
        return await col.find({ email: add }).project({ _id: 0 }).toArray();
    });
}

async function verfiPassword(email, pass) {
    const users = await getAccountByEmail(email.toLowerCase());
    if (!users || users.length === 0) return false;

    return {
        status: users[0].password === pass,
        user: users[0]
    };
}

async function newAnnouncement(title,msg) {
    return safeQuery(async () => {
        const col = await getCollection(sAnnouncement);
        return await col.insertOne({
            title,
            "message":msg,
            "timestamp":Date.now()
        });
    });
}

async function getAnnouncement() {
    return safeQuery(async () => {
        const col = await getCollection(sAnnouncement);
        return await col.find({ }).project({ _id: 0 }).toArray();
    });
}

// --------------------------------------
// Update functions
// --------------------------------------

async function updateEmail(email) {
    return safeQuery(async () => {
        const col = await getCollection(sUser);
        return await col.updateOne(
            { verfiCode: email },
            { $set: { isVerfiy: true } }
        );
    });
}

async function updateAddress(email, add) {
    return safeQuery(async () => {
        const col = await getCollection(sUser);
        return await col.updateOne(
            { email },
            { $set: {
                phone: add.phone,
                address: add.address,
                reciver: add.reciver
            }}
        );
    });
}

async function updatePassword(email, pwd) {
    return safeQuery(async () => {
        const col = await getCollection(sUser);
        const ret = await col.updateOne(
            { email },
            { $set: { password: pwd } }
        );
        return ret.matchedCount;
    });
}

// --------------------------------------
// General Queries
// --------------------------------------

async function getAllAccount() {
    return safeQuery(async () => {
        const col = await getCollection(sUser);
        return await col.find().project({ _id: 0 }).toArray();
    });
}

async function getAll(dbname) {
    return safeQuery(async () => {
        const col = await getCollection(dbname);
        return await col.find().project({}).toArray();
    });
}

async function delAll(dbname, filter) {
    return safeQuery(async () => {
        const col = await getCollection(dbname);
        return await col.deleteMany(filter);
    });
}

// --------------------------------------
// Tokens
// --------------------------------------

async function getAllAccountToken() {
    return safeQuery(async () => {
        const col = await getCollection(sUserToken);
        return await col.find().project({ _id: 0 }).toArray();
    });
}

async function getAccountToken(filter) {
    return safeQuery(async () => {
        const col = await getCollection(sUserToken);
        return await col.find(filter).project({ _id: 0 }).toArray();
    });
}

async function verfiToken(token) {
    return safeQuery(async () => {
        const col = await getCollection(sUserToken);
        const ret = await col.find({ t: token }).project({ _id: 0 }).toArray();

        if (ret.length > 0) {
            return await getAccountByEmail(ret[0].a);
        }

        return ret;
    });
}

async function newAccountToken(token, address) {
    return safeQuery(async () => {
        if ((await verfiToken(token)).length > 0) return false;

        const col = await getCollection(sUserToken);
        return await col.insertOne({ t: token, a: address });
    });
}




async function updateMinerAuth(type, data) {
  return safeQuery(async () => {
    const col = await getCollection(sMinerAuth);

    return await col.updateOne(
      { type },                      // 查询条件
      {
        $set: {
          data,
          timestamp: Date.now()
        }
      },
      { upsert: true }               // 不存在则新增
    );
  });
}


async function getMinerAuth(filter) {
    return safeQuery(async () => {
        const col = await getCollection(sMinerAuth);
        return await col.find(filter).project({ _id: 0 }).toArray();
    });
}

// --------------------------------------

// More

/**
 * ================================
 *   MongoDB NeDB-Compatible Wrapper
 * ================================
 * 保留 NeDB 风格:
 * tables.skins.find(...)
 * tables.skins.insert(...)
 * tables.skins.remove(...)
 * ...
 */

class MongoTable {
    constructor(name) {
        this.name = name; // collection name
    }

    async col() {
        return await getCollection(this.name);
    }

    // ======== NeDB.find() ========
    async find(query = {}) {
        const col = await this.col();
        return await col.find(query).toArray();
    }

    async sort(query = {}) {
        const col = await this.col();
        return await col.sort(query).toArray();
    }

    // ======== NeDB.findOne() ========
    async findOne(query = {}) {
        const col = await this.col();
        return await col.findOne(query);
    }

    // ======== NeDB.insert() ========
    async insert(doc) {
        const col = await this.col();
        const ret = await col.insertOne(doc);
        return { ...doc, _id: ret.insertedId };
    }

    // ======== NeDB.update() ========
    async update(query, update, options = {}) {
        const col = await this.col();
        return await col.updateMany(query, update, options);
    }

    // ======== NeDB.remove() ========
    async remove(query, options = { multi: true }) {
        const col = await this.col();
        const ret = await col.deleteMany(query);
        return ret.deletedCount;
    }
}


module.exports = {
    connect,
    newAccount,
    getAccountByAddress,
    getAllAccount,
    verfiToken,
    newAccountToken,
    getAllAccountToken,
    getAccountByEmail,
    updateEmail,
    verfiPassword,
    updateAddress,
    getAccountByWallet,
    getAll,
    delAll,
    getAccountToken,
    updatePassword,
    MongoTable,

    newAnnouncement,
    getAnnouncement,

    updateMinerAuth,
    getMinerAuth
};
