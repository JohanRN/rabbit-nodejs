require('dotenv').config()
const Cryptr = require("cryptr");

const KEY_ENCRYPTION = process.env.KEY_ENCRYPTION;
const cryptr = new Cryptr(KEY_ENCRYPTION);

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = NODE_ENV == "DEVELOP" ? cryptr.decrypt(process.env.DEVELOP_HOST) : cryptr.decrypt(process.env.PRODUCTION_HOST);
const DB_USER = NODE_ENV == "DEVELOP" ? cryptr.decrypt(process.env.DEVELOP_USER) : cryptr.decrypt(process.env.PRODUCTION_USER);
const DB_PASSWORD = NODE_ENV == "DEVELOP" ? cryptr.decrypt(process.env.DEVELOP_PASSWORD) : cryptr.decrypt(process.env.PRODUCTION_PASSWORD);

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

module.exports = {
    NODE_ENV,
    PORT,
    DB_NAME,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    AWS_REGION,
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY
}