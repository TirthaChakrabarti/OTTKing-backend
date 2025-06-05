const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "MyMySQL.123",
  database: process.env.DATABASE || "ottkingdevdb",
});

db.connect((error) => {
  if (error) {
    console.log("Error connecting to the database", error);
    process.exit(1);
  }

  console.log("Successfully connected to the MySQL database");
});

module.exports = db;
