const express = require("express");
const { ListSuscriptions } = require("../controllers/case.controller");
const router = express.Router();

router.post("/cases/getlist", ListSuscriptions);

module.exports = {
    routes: router,
};
