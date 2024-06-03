const mainElement = document.querySelector("main");

function createURLWithQueryStrings(url, queryStrings) {
  const searchParams = new URLSearchParams(queryStrings);
  return url + "?" + searchParams;
}

async function getData(url) {
  try {
    const res = await fetch(url);
    const articles = await res.json();
    return articles;
  } catch (e) {
    console.error(e);
  }
}

async function showArticles(options) {
  const url = createURLWithQueryStrings("/api/news", options);
  const articles = await getData(url);
  await renderData(articles, options.city ?? options.county ?? options.county);
}

function stringToHTML(str) {
  const parser = new DOMParser(),
    dom = parser.parseFromString(str, "text/html");
  return dom.body.firstChild;
}

function renderData(articles, location) {
  const articlesListElements = articles.map((article) => {
    return `<li class="article"><a target="_blank" class="article__link" href="${article.link}">${article.title}</a></li>`;
  });
  const element = stringToHTML(`
  <div class="location">
    <h2 class="location__welcome">Latest news from ${
      location ?? "the whole US"
    }</h2>
    <ul class="location__articles-list">
    ${articlesListElements.join("")}
    </ul>
  </div>`);
  mainElement.appendChild(element);
}

async function main() {
  await showArticles({
    city: "New York",
    state: "NY",
  });
  await showArticles({
    city: "Ashburn",
    state: "VA",
  });
  await showArticles({
    city: "Hemingford",
  });
  // await showArticles({});
}

main();
