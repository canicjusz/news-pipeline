import { escapeLiteral } from "./helpers.js";

class ArticlesGenerator {
  constructor(pool, parser) {
    this.pool = pool;
    this.rssParser = parser;
    // console.log(this.rssParser);
  }
  async process(row) {
    try {
      const feed = await this.rssParser.parseURL(
        `https://news.google.com/rss/search?q=${row.city}, ${row.county} in ${row.state}&hl=en-US&gl=US&ceid=US:en`
      );
      const articles = feed.items;
      console.log(articles.length, row.id);
      if (articles.length === 0) {
        return;
      }
      const uniqueArticles = this.#getUnique(articles);
      const firstArticles = uniqueArticles.slice(0, 4);
      const uninsertedArticles = await this.#getUninserted(firstArticles);
      if (uninsertedArticles.length === 0) {
        return;
      }
      const articlesIDs = await this.#addToDatabase(uninsertedArticles);
      await this.#makeMTMRelation(row.id, articlesIDs);
      console.log(
        `Articles ${articlesIDs.join(", ")} have been added to city of id ${
          row.id
        }`
      );
    } catch (e) {
      throw e;
    }
  }

  async #addToDatabase(articles) {
    const articlesValues = articles
      .map(
        ({ title, link }) => `(${escapeLiteral(title)}, ${escapeLiteral(link)})`
      )
      .join(",");
    const query = `INSERT INTO articles (title, link) VALUES ${articlesValues} RETURNING id`;
    const articleQueryResult = await this.pool.query(query);
    const articleIDs = articleQueryResult.rows.map(({ id }) => id);
    return articleIDs;
  }

  async #makeMTMRelation(locationID, articlesIDs) {
    const junctionTableValues = articlesIDs
      .map((articleID) => `(${articleID}, ${locationID})`)
      .join(",");
    await this.pool.query(
      "INSERT INTO cities_articles (article_id, city_id) VALUES " +
        junctionTableValues
    );
  }

  #getUnique(articles) {
    return articles.filter(
      (article, index, self) =>
        index === self.findIndex((t) => t.title === article.title)
    );
  }

  async #getUninserted(articles) {
    const constraints = articles
      .map((article) => "title=" + escapeLiteral(article.title))
      .join(" OR ");
    const existsQuery = `SELECT title FROM articles WHERE ${constraints}`;
    const existingArticles = await this.pool.query(existsQuery);
    const existingArticlesTitles = existingArticles.rows.map(
      (article) => article.title
    );
    const filteredArticles = articles.filter(
      (row) => !existingArticlesTitles.includes(row.title)
    );
    return filteredArticles;
  }
}

export default ArticlesGenerator;
