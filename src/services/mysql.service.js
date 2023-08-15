const { mysqlConnection } = require('../database/mysql.database');
const util = require('util');
const { createResponseObject } = require("../helpers/routes.helper");

const Async_mysql = {
    query: util.promisify(mysqlConnection.query).bind(mysqlConnection),
};

async function runQuery(query, params) {
    try {
        const results = await Async_mysql.query(query, [params]);
        if (results.length > 0) {
            return createResponseObject(200, 'data found', results[0]);
        } else {
            return createResponseObject(500, 'no data found', null);
        }
    } catch (error) {
        return createResponseObject(500, error.message, null);
    }
}

module.exports = {
    runQuery
}