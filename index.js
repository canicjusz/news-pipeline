import etl from "etl";
import fs from "fs";
import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";
import Parser from "rss-parser";
import { parse, transform, generate } from "csv";
import pMap from "p-map";

// https://github.com/brianc/node-postgres/blob/83a946f61cb9e74c7f499e44d03a268c399bd623/lib/client.js
function escapeLiteral(str) {
  let hasBackslash = false;
  let escaped = "'";

  if (typeof str !== "string") return str;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "'") {
      escaped += c + c;
    } else if (c === "\\") {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }

  escaped += "'";

  if (hasBackslash === true) escaped = " E" + escaped;

  return escaped;
}

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const rssParser = new Parser();

// parse('')

let data = [];

async function populateDataArr() {
  const result = await pool.query("SELECT * FROM cities");
  data = result.rows;
}

// async function populateDataArr() {
//   const parser = fs
//     .createReadStream("uscities.csv")
//     .pipe(parse({ columns: true }))
//     .pipe(
//       transform((record) => {
//         return {
//           city: record.city,
//           state: record.state_id,
//           county: record.county_name,
//         };
//       })
//     );

//   for await (const record of parser) {
//     // Work with each record
//     data.push(record);
//   }
// }
await populateDataArr();
// await pool.query("DELETE FROM cities");
// const cityQueryResult = await pool.query(
//   // console.log(
//   "INSERT INTO cities (city, state, county) VALUES " +
//     data
//       .map(
//         ({ city, state, county }) =>
//           `(${escapeLiteral(city)}, ${escapeLiteral(state)}, ${escapeLiteral(
//             county
//           )})`
//       )
//       .join(",") +
//     " RETURNING id"
//   // );
// );
// data.forEach((row, i) => {
//   row.id = cityQueryResult.rows[i].id;
// });
// console.log(data);
// const funcArr = data.map((row) => superFunction(row));

const result = await pMap(data, superFunction, { concurrency: 5 });

async function superFunction(row) {
  await new Promise((res) => setTimeout(res, 1000 * Math.random()));
  try {
    const feed = await rssParser.parseURL(
      `https://news.google.com/rss/search?q=${row.city} ${row.county} in ${row.state}&hl=en-US&gl=US&ceid=US:en`
    );
    const insertStr = feed.items
      .slice(0, 4)
      .map(
        ({ title, link }) => `(${escapeLiteral(title)}, ${escapeLiteral(link)})`
      )
      .join(",");
    const query =
      "INSERT INTO articles (title, link) VALUES " +
      insertStr +
      " ON CONFLICT DO NOTHING RETURNING id;";
    try {
      const articleQueryResult = await pool.query(query);
      await pool.query(
        "INSERT INTO cities_articles (article_id, city_id) VALUES " +
          articleQueryResult.rows
            .map((articleRow) => `(${articleRow.id}, ${row.id})`)
            .join(",")
      );
      // console.log(articleQueryResult);
    } catch (e) {
      // console.error(e, query);
    }
  } catch (e) {
    console.log(e);
    await superFunction(row);
  }
}
//   for (const row of data) {
//     const feed = await rssParser.parseURL(
//       `https://news.google.com/rss/search?q=${row.city} ${row.county} in ${row.state}&hl=en-US&gl=US&ceid=US:en`
//     );
//     const insertStr = feed.items
//       .slice(0, 4)
//       .map(
//         ({ title, link }) => `(${escapeLiteral(title)}, ${escapeLiteral(link)})`
//       )
//       .join(",");
//     const query =
//       "INSERT INTO articles (title, link) VALUES " +
//       insertStr +
//       " ON CONFLICT DO NOTHING RETURNING id;";
//     try {
//       const articleQueryResult = await pool.query(query);
//       await pool.query(
//         "INSERT INTO cities_articles (article_id, city_id) VALUES " +
//           articleQueryResult.rows
//             .map((articleRow) => `(${articleRow.id}, ${row.id})`)
//             .join(",")
//       );
//     } catch (e) {
//       // console.error(e, query);
//     }
//   }
// }

// data.forEach(()=>{
//   const feed = await parser.parseURL(
//   `https://news.google.com/rss/search?q=${d.city} ${d.county_name} in ${d.state_name}&hl=en-US&gl=US&ceid=US:en`
// );
//       // const cityQueryResult = await client.query(
//       //   "SELECT * FROM cities WHERE city=$1 AND state=$2 AND county=$3",
//       //   [d.city, d.state_id, d.county_name]
//       // );
//       // console.log("xD");
//       // const cityID = cityQueryResult.rows[0].id;
//       const actualData = feed.items.slice(4).forEach((item) => {
//         pool.query(
//           `INSERT INTO articles (title, link) VALUES ($1, $2)`,
//           [item.title, item.link]
//           // ,
//           // (result) => {
//           //   const articleID = result.rows[0].id;
//           //   pool.query(
//           //     `INSERT INTO cities_articles (article_id, city_id) VALUES ($1, $2)`,
//           //     [articleID, cityID]
//           //   );
//           // }
//         );
//       });
// })
//   .pipe(etl.csv())
//   // map `date` into a javascript date and set unique _id
//   .pipe(
//     etl.map((d) => ({
//       state: d.state_id,
//       county: d.county_name,
//       city: d.city,
//     }))
//   )
// .pipe(etl.postgres.upsert(pool, "public", "cities", { concurrency: 4 }))

//   .pipe(
//     etl.map(async (d) => {
//       const feed = await parser.parseURL(
//         `https://news.google.com/rss/search?q=${d.city} ${d.county_name} in ${d.state_name}&hl=en-US&gl=US&ceid=US:en`
//       );
//       // const cityQueryResult = await client.query(
//       //   "SELECT * FROM cities WHERE city=$1 AND state=$2 AND county=$3",
//       //   [d.city, d.state_id, d.county_name]
//       // );
//       // console.log("xD");
//       // const cityID = cityQueryResult.rows[0].id;
//       const actualData = feed.items.slice(4).forEach((item) => {
//         pool.query(
//           `INSERT INTO articles (title, link) VALUES ($1, $2)`,
//           [item.title, item.link]
//           // ,
//           // (result) => {
//           //   const articleID = result.rows[0].id;
//           //   pool.query(
//           //     `INSERT INTO cities_articles (article_id, city_id) VALUES ($1, $2)`,
//           //     [articleID, cityID]
//           //   );
//           // }
//         );
//       });
//       return actualData;
//     })
//   );

// // const gowno = pool.query(`SELECT FROM * (title, link) VALUES ($1, $2)`)
// //   pool.query(`INSERT INTO articles (title, link) VALUES ($1, $2)`, [item.title, item.link], (result)=>{
// //     const articleID =  rows[0].id;
// //     pool.query(`INSERT INTO cities_articles (article_id, city_id) VALUES ($1, $2)`, [articleID, cityID])
// //   })

// // .pipe(etl.collect(1000))
// // .pipe(console.log);

// // .pipe(etl.postgres.upsert(pool, "public", "cities", { concurrency: 4 }))
