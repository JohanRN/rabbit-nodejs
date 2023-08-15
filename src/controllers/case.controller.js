const { runQuery } = require("../services/mysql.service")
const Message = require("../models/message.model");
const createError = require("http-errors");

async function ListSuscriptions(req, res, next) {
    try {
        const params = [null, null, null]
        const result = await runQuery("Call sp_suscripciones_Listar(?)", params);
        if (typeof result == 'object') {
            if (result.length > 0) {
                new Message(200, "data found", result).send(res);
            } else {
                new Message(404, "data not found", result).send(res);
            }
        } else {
            new Message(500, result, null).send(res);
        }
    } catch (error) {
        next(createError.InternalServerError(error.message));
    }
}

module.exports = {
    ListSuscriptions,
};