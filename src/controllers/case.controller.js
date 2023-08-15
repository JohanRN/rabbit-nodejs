const { getSuscriptions } = require("../server/case.server");
const createError = require("http-errors");

async function ListSuscriptions(req, res, next) {
    try {
        const result = await getSuscriptions([null, null, 0]);
        const codeHTTP = parseInt(result.status) || 500;
        return res.status(codeHTTP).json(result);
    } catch (error) {
        next(createError.InternalServerError(error.message));
    }
}

module.exports = {
    ListSuscriptions,
};
