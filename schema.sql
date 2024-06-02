-- public.articles definition

-- Drop table

-- DROP TABLE public.articles;

CREATE TABLE public.articles (
	title varchar(255) NULL,
	link varchar NULL,
	id serial4 NOT NULL,
	CONSTRAINT articles_pk PRIMARY KEY (id)
);
CREATE UNIQUE INDEX articles_title_idx ON public.articles USING btree (title);

-- public.cities definition

-- Drop table

-- DROP TABLE public.cities;

CREATE TABLE public.cities (
	city varchar(100) NULL,
	state varchar(2) NULL,
	county varchar(50) NULL,
	id serial4 NOT NULL,
	CONSTRAINT cities_pk PRIMARY KEY (id)
);
CREATE UNIQUE INDEX cities_city_idx ON public.cities USING btree (city, state, county);

-- public.cities_articles definition

-- Drop table

-- DROP TABLE public.cities_articles;

CREATE TABLE public.cities_articles (
	article_id int4 NOT NULL,
	city_id int4 NOT NULL,
	CONSTRAINT cities_articles_pkey PRIMARY KEY (article_id, city_id),
	CONSTRAINT cities_articles_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT cities_articles_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON UPDATE CASCADE
);