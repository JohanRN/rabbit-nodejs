const { mysqlConnection } = require('../database/mysql.database');
const util = require('util');
const { Message } = require("../models/message.model");

const Async_mysql = {
    query: util.promisify(mysqlConnection.query).bind(mysqlConnection),
};

async function runQuery(query, params) {
    try {
        const results = await Async_mysql.query(query, [params]);
        if (results.length > 0) {
            return results[0]
        } else {
            return []
        }
    } catch (error) {
        return error.message;
    }
}

module.exports = {
    runQuery
}