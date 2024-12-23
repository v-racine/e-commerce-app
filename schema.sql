CREATE TABLE "products" (
  "id" serial PRIMARY KEY,
  "title" varchar(100),
  "price" numeric(6,2),
  "image" text
);

CREATE TABLE "carts" (
  "id" serial PRIMARY KEY
);

CREATE TABLE "products_carts" (
  "id" serial PRIMARY KEY,
  "product_id" integer,
  "cart_id" integer,
  "quantity" integer
);

CREATE TABLE "admin_users" (
  "id" serial PRIMARY KEY,
  "email" varchar(150),
  "password" text
);

ALTER TABLE "products_carts" ADD FOREIGN KEY ("cart_id") REFERENCES "carts" ("id");

ALTER TABLE "products_carts" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");
