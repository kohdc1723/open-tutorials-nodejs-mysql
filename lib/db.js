const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1723",
    database: "open-tutorials"
});
db.connect();

module.exports = db;