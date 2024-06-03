import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

class Database {
  static #instance = undefined;

  static setInstance(options) {
    Database.#instance = new Pool(options);
  }

  static getInstance() {
    if (Database.#instance) {
      return Database.#instance;
    } else {
      throw new Error("Connection to the database wasn't established yet.");
    }
  }
}

Database.setInstance({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export default Database;
