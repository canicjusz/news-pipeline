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

export default Database;
