import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const productCdEnum = pgEnum("product_cd", [
  "W",
  "H",
  "C",
  "S",
  "R",
]);

export const deviceEnum = pgEnum("device_type", ["mobile", "desktop"]);

export const cardTypeEnum = pgEnum("card_type", [
  "visa",
  "mastercard",
  "discover",
  "amex",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    transactionId: text("transaction_id").notNull().unique(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    productCd: productCdEnum("product_cd").notNull(),
    device: deviceEnum("device_type").notNull(),
    cardType: cardTypeEnum("card_type").notNull(),
    emailDomain: text("email_domain").notNull(),
    emailDomainRisk: numeric("email_domain_risk", {
      precision: 6,
      scale: 4,
    }).notNull(),
    transactionHour: integer("transaction_hour").notNull(),
    addrMatch: boolean("addr_match").notNull(),
    cardTxnCount: integer("card_txn_count").notNull(),
    amtToCardMeanRatio: numeric("amt_to_card_mean_ratio", {
      precision: 10,
      scale: 4,
    }).notNull(),
    isFraud: boolean("is_fraud").notNull().default(false),
    fraudProbability: numeric("fraud_probability", {
      precision: 6,
      scale: 4,
    }).notNull(),
    riskLevel: riskLevelEnum("risk_level").notNull().default("low"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_transactions_is_fraud").on(table.isFraud),
    index("idx_transactions_product_cd").on(table.productCd),
    index("idx_transactions_hour").on(table.transactionHour),
    index("idx_transactions_risk").on(table.riskLevel),
  ],
);

export const fraudAlerts = pgTable(
  "fraud_alerts",
  {
    id: serial("id").primaryKey(),
    transactionId: text("transaction_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    rule: text("rule").notNull(),
    severity: riskLevelEnum("severity").notNull().default("high"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_fraud_alerts_severity").on(table.severity)],
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type FraudAlert = typeof fraudAlerts.$inferSelect;
