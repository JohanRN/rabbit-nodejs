const { runQuery } = require("../services/mysql.service")


async function getSuscriptions(params) {
    const result = await runQuery("Call sp_suscripciones_Listar(?)", params);
    return result
}

module.exports = {
    getSuscriptions,
};