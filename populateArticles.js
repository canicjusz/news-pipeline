import pkg from "pg";
const { Pool } = pkg;

import { Transform, PassThrough } from "stream";
import QueryStream from "pg-query-stream";
import "dotenv/config";

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
pool.connect(async (err, client, done) => {
  if (err) throw err;
  const query = new QueryStream("SELECT * FROM cities ");
  const stream = client.query(query);
  stream.on("end", done);
  for await (const row of stream) {
    try {
      const feed = await rssParser.parseURL(
        `https://news.google.com/rss/search?q=${row.city} ${row.county} in ${row.state}&hl=en-US&gl=US&ceid=US:en`
      );
      const insertStr = feed.items
        .slice(0, 4)
        .map(
          ({ title, link }) =>
            `(${escapeLiteral(title)}, ${escapeLiteral(link)})`
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
      } catch (e) {}
    } catch (e) {
      console.log(e);
      await superFunction(row);
    }
  }
});
// //release the client when the stream is finished
// stream.on('end', done)
// stream.pipe(workerThing).pipe()

// fs.createReadStream('eupmc_lite_metadata_2016_04_15.json')
// .pipe(JSONstream.parse())
// .pipe(workerThing)

// async function superFunction(row) {
//   await new Promise((res) => setTimeout(res, 1000 * Math.random()));
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
// }
