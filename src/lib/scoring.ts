export type ProductCd = "W" | "H" | "C" | "S" | "R";
export type DeviceType = "mobile" | "desktop";
export type CardType = "visa" | "mastercard" | "discover" | "amex";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ScoreInput {
  amount: number;
  productCd: ProductCd;
  device: DeviceType;
  cardType: CardType;
  emailDomain: string;
  hour: number; // 0-23
  addrMatch: boolean;
  cardTxnCount: number;
  amtToCardMeanRatio: number;
}

export interface FeatureContribution {
  key: string;
  label: string;
  value: number; // log-odds contribution (negative pushes toward "safe")
  detail: string;
}

export interface ScoreResult {
  probability: number; // 0..1
  riskLevel: RiskLevel;
  logit: number;
  contributions: FeatureContribution[];
  triggeredRules: { id: number; title: string; detail: string }[];
  recommendation: string;
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwawaymail.com",
  "dispostable.com",
  "fakemail.com",
  "getnada.com",
  "trashmail.com",
]);

const HIGH_RISK_DOMAINS = new Set([
  "protonmail.com",
  "tutanota.com",
  "cock.li",
  "mail.ru",
]);

export function emailDomainRisk(domain: string): number {
  const d = domain.trim().toLowerCase();
  if (DISPOSABLE_DOMAINS.has(d)) return 0.92;
  if (HIGH_RISK_DOMAINS.has(d)) return 0.48;
  // Generic free providers are comparatively low-risk
  return 0.06;
}

const PRODUCT_LABEL: Record<ProductCd, string> = {
  W: "W — General retail",
  H: "H — Home goods",
  C: "C — Digital goods & gift cards",
  S: "S — Software & services",
  R: "R — Travel & rewards",
};

function sigmoid(z: number): number {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

/**
 * Transparent, explainable fraud model.
 * Contributions are additive in log-odds space (mirrors a calibrated
 * gradient-boosted model + SHAP decompositions from the original project).
 */
export function scoreTransaction(input: ScoreInput): ScoreResult {
  const amount = Math.max(0, Number(input.amount) || 0);
  const logAmt = Math.log(amount + 1);
  const domainRisk = emailDomainRisk(input.emailDomain);

  const contributions: FeatureContribution[] = [];

  // Transaction amount (SHAP top predictor: log_amt)
  const amtContrib = 0.32 * logAmt - 1.0;
  contributions.push({
    key: "log_amt",
    label: "Transaction amount",
    value: amtContrib,
    detail:
      amount >= 1000
        ? "High-value transfer — above the typical customer spend envelope."
        : "Amount is within the normal spend distribution.",
  });

  // Product category (SHAP: C1) — Category C carries 3.3x the average risk
  const productWeights: Record<ProductCd, { w: number; note: string }> = {
    C: { w: 1.35, note: "Category C shows a 11.7% fraud rate — 3.3× the baseline." },
    S: { w: 0.4, note: "Category S carries moderately elevated risk." },
    H: { w: 0.2, note: "Category H carries slightly elevated risk." },
    R: { w: 0.1, note: "Category R is close to the network average." },
    W: { w: -0.5, note: "Category W is the lowest-risk category (2.0% fraud)." },
  };
  const p = productWeights[input.productCd];
  contributions.push({
    key: "product",
    label: `Product category (${input.productCd})`,
    value: p.w,
    detail: `${PRODUCT_LABEL[input.productCd]}. ${p.note}`,
  });

  // Device (mobile carries 1.56x risk)
  const deviceContrib = input.device === "mobile" ? 0.22 : -0.06;
  contributions.push({
    key: "device",
    label: input.device === "mobile" ? "Mobile device" : "Desktop device",
    value: deviceContrib,
    detail:
      input.device === "mobile"
        ? "Mobile-originated payments carry 1.56× the fraud risk of desktop."
        : "Desktop origin is below the network fraud baseline.",
  });

  // Card type (Discover has the highest fraud rate)
  const cardWeights: Record<CardType, { w: number; note: string }> = {
    discover: { w: 0.42, note: "Discover cards show the highest fraud rate (7.7%)." },
    amex: { w: 0.16, note: "American Express shows slightly elevated risk." },
    mastercard: { w: 0.02, note: "Mastercard is near the network average." },
    visa: { w: -0.08, note: "Visa is the most common and lower-risk network." },
  };
  const c = cardWeights[input.cardType];
  contributions.push({
    key: "card",
    label: `${capitalize(input.cardType)} card`,
    value: c.w,
    detail: c.note,
  });

  // Time-of-day (fraud peaks at 7AM — automated bot activity)
  const hour = Math.min(23, Math.max(0, Math.round(input.hour)));
  const hourContrib = hour >= 5 && hour <= 9 ? 0.5 * Math.exp(-((hour - 7) ** 2) / 5) : -0.05;
  contributions.push({
    key: "hour",
    label: `Time of day (${hour}:00)`,
    value: hourContrib,
    detail:
      hour >= 5 && hour <= 9
        ? "Early-morning window (5–9AM) sees a fraud spike — typical of bot-driven attacks."
        : "Outside the high-risk early-morning window.",
  });

  // Address match
  const addrContrib = input.addrMatch ? -0.18 : 0.48;
  contributions.push({
    key: "addr",
    label: "Billing / shipping match",
    value: addrContrib,
    detail: input.addrMatch
      ? "Billing and shipping addresses match."
      : "Billing and shipping addresses do not match — a common fraud signal.",
  });

  // Card velocity (SHAP: C14)
  const txnCount = Math.max(0, Number(input.cardTxnCount) || 0);
  const velocityContrib = Math.min(txnCount, 60) / 60 * 0.85;
  contributions.push({
    key: "velocity",
    label: "Card velocity",
    value: velocityContrib,
    detail:
      txnCount > 30
        ? `Card used ${txnCount} times recently — unusually high velocity.`
        : "Card activity is within normal velocity bounds.",
  });

  // Spending ratio vs card mean (SHAP: C13)
  const ratio = Math.max(0, Number(input.amtToCardMeanRatio) || 0);
  const ratioContrib = ratio >= 5 ? 0.85 : ratio >= 3 ? 0.5 : ratio >= 1.5 ? 0.18 : -0.1;
  contributions.push({
    key: "ratio",
    label: "Spend vs. card average",
    value: ratioContrib,
    detail:
      ratio >= 3
        ? `Transaction is ${ratio.toFixed(1)}× the card's average spend — unusual spending pattern.`
        : "Spend is consistent with the card's history.",
  });

  // Email domain risk
  const domainContrib = domainRisk >= 0.7 ? 1.1 : domainRisk >= 0.4 ? 0.45 : domainRisk >= 0.3 ? 0.15 : -0.04;
  contributions.push({
    key: "domain",
    label: `Email domain (${input.emailDomain.toLowerCase()})`,
    value: domainContrib,
    detail:
      domainRisk >= 0.7
        ? "Disposable / temporary email domain — heavily used in fraud."
        : domainRisk >= 0.3
          ? "Elevated-risk email domain."
          : "Standard email provider.",
  });

  const intercept = -4.45;
  const logit =
    intercept +
    contributions.reduce((sum, c) => sum + c.value, 0);

  const probability = sigmoid(logit);

  let riskLevel: RiskLevel = "low";
  if (probability >= 0.5) riskLevel = "critical";
  else if (probability >= 0.18) riskLevel = "high";
  else if (probability >= 0.1) riskLevel = "medium";

  const sorted = [...contributions].sort((a, b) => b.value - a.value);
  const topRisks = sorted.filter((c) => c.value >= 0.3);

  const triggeredRules: ScoreResult["triggeredRules"] = [];
  if (txnCount > 50)
    triggeredRules.push({ id: 1, title: "High-velocity card alert", detail: "Card exceeded 50 transactions." });
  if (ratio >= 5)
    triggeredRules.push({ id: 2, title: "Unusual spending alert", detail: "Transaction >5× the card's historical mean." });
  if (domainRisk >= 0.7)
    triggeredRules.push({ id: 3, title: "High-risk email domain", detail: "Disposable email provider detected." });
  if (hour >= 5 && hour <= 9)
    triggeredRules.push({ id: 4, title: "Early-morning alert", detail: "Transaction in the 5–9AM high-risk window." });
  if (input.productCd === "C" && amount > 200)
    triggeredRules.push({ id: 5, title: "Category C review", detail: "Category C purchase above $200." });

  const recommendation =
    riskLevel === "critical"
      ? "Block immediately and initiate a manual review. Notify the customer via a second channel."
      : riskLevel === "high"
        ? "Step-up authentication (3-D Secure) before completing the payment."
        : riskLevel === "medium"
          ? "Allow the transaction but route it to the monitoring queue."
          : "Approve — no additional verification required.";

  return {
    probability,
    riskLevel,
    logit,
    contributions: sorted,
    triggeredRules,
    recommendation,
  };
}

export function riskLevelForProbability(probability: number): RiskLevel {
  if (probability >= 0.5) return "critical";
  if (probability >= 0.18) return "high";
  if (probability >= 0.1) return "medium";
  return "low";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
