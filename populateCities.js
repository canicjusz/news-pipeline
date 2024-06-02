import Database from "./database.js";
import { Writable } from "stream";
import fs from "fs";
import { parse, transform } from "csv";
import { pipeline } from "stream/promises";
import "dotenv/config";

class WriteToDB extends Writable {
  rows = [];

  write(row) {
    this.rows.push(
      pool.query(
        "INSERT INTO cities (city, state, county) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [row.city, row.state, row.county]
      )
    );
  }
  async end() {
    await Promise.all(this.rows);
    console.log("Locations added to the database");
    return;
  }
}

const writeToDB = new WriteToDB();

Database.setInstance({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const pool = Database.getInstance();

async function populateCities() {
  await pipeline(
    fs.createReadStream("uscities.csv"),
    parse({ columns: true }),
    transform((record) => {
      return {
        city: record.city,
        state: record.state_id,
        county: record.county_name,
      };
    }),
    writeToDB
  );
}

populateCities();
