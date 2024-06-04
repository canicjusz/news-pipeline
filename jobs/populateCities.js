import Database from "../database.js";
import { Writable } from "stream";
import fs from "fs";
import { parse, transform } from "csv";
import { pipeline } from "stream/promises";
import "dotenv/config";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class WriteToDB extends Writable {
  rows = [];

  write(row) {
    this.rows.push(
      pool.query(
        "INSERT INTO cities (city, state, county) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [
          row.city.toLowerCase(),
          row.state.toLowerCase(),
          row.county.toLowerCase(),
        ]
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

const pool = Database.getInstance();

async function populateCities() {
  await pipeline(
    fs.createReadStream(path.join(__dirname, "../data/uscities.csv")),
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
