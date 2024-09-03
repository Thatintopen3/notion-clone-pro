import { relations } from "drizzle-orm";
import { prices, products, subscriptions } from "./schema";

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  products: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
}));
