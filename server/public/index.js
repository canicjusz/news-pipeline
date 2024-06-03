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
  return dom.firstChild;
}

function renderData(articles, location) {
  const articlesListElements = articles.map((article) => {
    return `<li><a href="${article.link}">${article.title}</a></li>`;
  });
  const element = stringToHTML(`
  <div class="location">
    <h2 class="location__welcome">Latest news from ${location}</h2>
    <ul class="location__articles-list">
    ${articlesListElements.join("")}
    </ul>
  </div>`);
  document.body.appendChild(element);
}

const NYUrl = createURLWithQueryStrings("/api/news", {
  city: "New York",
  state: "NY",
});

showArticles({
  city: "New York",
  state: "NY",
});
showArticles({
  city: "Ashburn",
  state: "VA",
});

showArticles({
  city: "Cincinnati",
  state: "AR",
});
