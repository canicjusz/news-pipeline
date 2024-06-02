import express from "express";
import "dotenv/config";
import path from "path";
import newsController from "./controllers/news.controller.js";
import Database from "./database.js";
const app = express();
const __dirname = path.resolve();

app.use(express.static("public"));

Database.setInstance({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.get("/", (req, res) => {
  const pathToIndex = path.join(__dirname, "/views/index.html");
  res.sendFile(pathToIndex);
});

app.get("/api/news", newsController.get);

const port = process.env.SERVER_PORT ?? 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
