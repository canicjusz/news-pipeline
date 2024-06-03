import Database from "../database.js";
import "dotenv/config";
import { ProcessConcurrently } from "../helpers.js";
import ArticlesGenerator from "../articlesGenerator.js";
import Parser from "rss-parser";
import LocationsDownloader from "../locationsDownloader.js";

const pool = Database.getInstance();
const rssParser = new Parser();

pool.connect(async (err, client, done) => {
  if (err) throw err;
  const locationsStream = LocationsDownloader.download(client, done);
  console.log("location stream");
  const articlesGenerator = new ArticlesGenerator(pool, rssParser);
  const processArticlesConcurrently = new ProcessConcurrently(
    articlesGenerator.process,
    1,
    articlesGenerator
  );
  for await (const row of locationsStream) {
    console.log("elo");
    await processArticlesConcurrently.push([row]);
  }
  console.log("Articles updated!");
});
