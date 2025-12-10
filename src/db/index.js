const knex = require("knex");
const knexConfig = require("../../knexfile");
const config = require("../config");

// Select environment config
const environment = config.env || "development";
const dbConfig = knexConfig[environment];

const db = knex(dbConfig);

module.exports = db;
