const buff_update_auth = require("../utils/buff/auth_update");
const igxe_update_auth = require("../utils/igxe/auth_update");
const uuyp_update_auth = require("../utils/uupy/auth_update");

const init = async () =>
{
    await buff_update_auth.auth_update();
    await igxe_update_auth.auth_update();
    await uuyp_update_auth.auth_update();
    process.exit(0)
}