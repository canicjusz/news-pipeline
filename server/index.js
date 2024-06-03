import express from "express";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import newsController from "./controllers/news.controller.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  express.static("public"),
  express.static(path.join(__dirname, "/public"))
);

app.get("/", (req, res) => {
  const pathToIndex = path.join(__dirname, "/views/index.html");
  res.sendFile(pathToIndex);
});

app.get("/api/news", newsController.get);

const port = process.env.SERVER_PORT ?? 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
