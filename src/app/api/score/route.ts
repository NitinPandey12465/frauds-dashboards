import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDatabaseReady } from "@/db/init";
import { transactions } from "@/db/schema";
import {
  scoreTransaction,
  type ProductCd,
  type DeviceType,
  type CardType,
} from "@/lib/scoring";

export const dynamic = "force-dynamic";

const PRODUCTS: ProductCd[] = ["W", "H", "C", "S", "R"];
const DEVICES: DeviceType[] = ["mobile", "desktop"];
const CARDS: CardType[] = ["visa", "mastercard", "discover", "amex"];

export async function POST(request: Request) {
  try {
    await ensureDatabaseReady();
    const body = await request.json();

    const amount = Number(body.amount);
    const hour = Number(body.hour);
    const cardTxnCount = Number(body.cardTxnCount ?? 0);
    const amtToCardMeanRatio = Number(body.amtToCardMeanRatio ?? 1);

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number." },
        { status: 400 },
      );
    }

    const productCd: ProductCd = PRODUCTS.includes(body.productCd)
      ? body.productCd
      : "W";
    const device: DeviceType = DEVICES.includes(body.device)
      ? body.device
      : "desktop";
    const cardType: CardType = CARDS.includes(body.cardType)
      ? body.cardType
      : "visa";
    const emailDomain =
      typeof body.emailDomain === "string" && body.emailDomain.trim()
        ? body.emailDomain.trim().toLowerCase()
        : "gmail.com";
    const addrMatch = body.addrMatch !== false;
    const safeHour = Number.isFinite(hour)
      ? Math.min(23, Math.max(0, Math.round(hour)))
      : 12;

    const result = scoreTransaction({
      amount,
      productCd,
      device,
      cardType,
      emailDomain,
      hour: safeHour,
      addrMatch,
      cardTxnCount: Number.isFinite(cardTxnCount) ? cardTxnCount : 0,
      amtToCardMeanRatio: Number.isFinite(amtToCardMeanRatio)
        ? amtToCardMeanRatio
        : 1,
    });

    // Record the analyzed transaction so the live dashboard updates.
    const transactionId = `TX-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 36,
    ).toString(36)}`;
    await db.insert(transactions).values({
      transactionId,
      amount: amount.toFixed(2),
      productCd,
      device,
      cardType,
      emailDomain,
      emailDomainRisk: "0.06",
      transactionHour: safeHour,
      addrMatch,
      cardTxnCount,
      amtToCardMeanRatio: String(
        Math.round(amtToCardMeanRatio * 10000) / 10000,
      ),
      isFraud: false,
      fraudProbability: String(Math.round(result.probability * 10000) / 10000),
      riskLevel: result.riskLevel,
    });

    return NextResponse.json({
      transactionId,
      ...result,
    });
  } catch (err) {
    console.error("Score API error", err);
    return NextResponse.json(
      { error: "Failed to score transaction." },
      { status: 500 },
    );
  }
}
