# News pipeline

## Prerequisites

- Postgresql
- Node.js
- npm

## Setup

1. `npm install` - Install all the dependencies
2. Create a database and create the structure using `schema.sql`
3. Populate tables yourself by running `npm run cities:populate` and then `npm run articles:populate` or use prepared data:
   1. Copy `data/articles_*.csv` to the `articles` table
   2. Copy `data/cities_*.csv` to the `cities` table
   3. Copy `data/cities_articles_*.csv` to the `cities_articles` table
4. Add environmental variables into a `.env` file. For reference follow `.env.example`
5. Run server with `npm run dev`
