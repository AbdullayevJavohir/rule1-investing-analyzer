import {
  mysqlTable,
  serial,
  varchar,
  decimal,
  timestamp,
  int,
  json,
} from "drizzle-orm/mysql-core";

export const analyses = mysqlTable("analyses", {
  id: serial("id").primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  meaningScore: int("meaning_score").notNull().default(0),
  moatScore: int("moat_score").notNull().default(0),
  managementScore: int("management_score").notNull().default(0),
  marginOfSafetyScore: int("margin_of_safety_score").notNull().default(0),
  financialQualityScore: int("financial_quality_score").notNull().default(0),
  predictabilityScore: int("predictability_score").notNull().default(0),
  totalScore: int("total_score").notNull().default(0),
  classification: varchar("classification", { length: 50 }),
  recommendation: varchar("recommendation", { length: 50 }),
  currentPrice: decimal("current_price", { precision: 12, scale: 2 }),
  stickerPrice: decimal("sticker_price", { precision: 12, scale: 2 }),
  mosPrice: decimal("mos_price", { precision: 12, scale: 2 }),
  technicalScore: int("technical_score"),
  bigFiveNumbers: json("big_five_numbers"),
  redFlags: json("red_flags"),
  analysisData: json("analysis_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const watchlist = mysqlTable("watchlist", {
  id: serial("id").primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});
