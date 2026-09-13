# 💰 FARM SEVA — PHASE 10 BUSINESS MODEL & REVENUE ENGINE SPECIFICATION

## Executive Summary
FARM SEVA Phase 10 establishes a sustainable, transparent, and multi-stream commercial model for the agricultural marketplace. Designed specifically for Indian farmers, sellers, FPOs, and agricultural inputs ecosystem, FARM SEVA powers marketplace transactions with zero secret pay-to-rank bias, robust commission structures, dynamic hold periods, automated settlements, and anti-abuse promotion engines.

---

## 1. Revenue Streams & Commission Engine

### 1.1 Category-Based Platform Commissions
FARM SEVA charges seller partners a percentage commission per completed order based on product category:
- **Seeds (`SEEDS`):** 5.0% commission.
- **Fertilizers (`FERTILIZERS`):** 3.5% commission (low margin, volume-based essential input).
- **Pesticides / Insecticides (`PESTICIDES`):** 6.0% commission.
- **Farm Machinery & Tools (`TOOLS` / `MACHINERY`):** 4.0% commission.
- **Bio-fertilizers & Organic Inputs (`ORGANIC`):** 5.0% commission.
- **Default Category Fallback:** 5.0% commission.

### 1.2 Convenience & Delivery Fee Model
- **Farmer Convenience Fee:** ₹0 (Free for farmers).
- **Delivery Charges:** Dynamic distance-based fee calculated during checkout. Orders above ₹1,000 qualify for free farmer shipping (absorbed partially by seller promotion or platform volume).

### 1.3 Premium Seller Tier (Future Expansion Ready)
- **Verified Seller Badge:** Annual verification fee ₹2,999/year.
- **Priority Customer Support & Analytics:** Included for verified sellers.

---

## 2. Dynamic Settlement & Financial Cycle

### 2.1 Seller Payout Lifecycle
```
[ Farmer Places Order ] ──► [ Payment Collected ] ──► [ Order Delivered ]
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
                                 [ Hold Period (7 Days) ]            [ Settlement Batch ]
                                            │                                   │
                                            └─────────────────┬─────────────────┘
                                                              ▼
                                                 [ Double-Entry Payout ]
                                                              │
                                                              ▼
                                                 [ Bank / UPI Transfer ]
```

### 2.2 Settlement Mechanics & Hold Period
- **Configurable Hold Period:** Managed via `BusinessSetting.sellerSettlementDays` (Default: 7 days post-delivery).
- **Settlement Eligibility Criteria:**
  1. Order status MUST be `DELIVERED`.
  2. Post-delivery hold period (e.g. 7 days) MUST have elapsed.
  3. No active customer dispute or return request opened.
- **Batch Processing:** Daily automated settlement cron scans eligible delivered orders, aggregates net payable per seller, records double-entry payout journal, and emits bank payout dispatch payloads.

---

## 3. Financial Invariants & Double-Entry Accounting

### 3.1 Account Taxonomy & Chart of Accounts
1. `ASSET:GATEWAY_HOLDING` - Gateway funds held prior to settlement.
2. `REVENUE:PLATFORM_COMMISSION` - FARM SEVA earned commission revenue.
3. `LIABILITY:SELLER_PAYABLE` - Seller pending balance awaiting payout.
4. `ASSET:BANK_PAYOUT` - Outgoing bank payout account.
5. `EXPENSE:PROMOTION_DISCOUNT` - Platform coupon & referral rewards expense.

### 3.2 Double-Entry Journal Examples
- **Order Created (₹1,000 order, 5% Commission = ₹50):**
  - `DEBIT ASSET:GATEWAY_HOLDING ₹1000`
  - `CREDIT REVENUE:PLATFORM_COMMISSION ₹50`
  - `CREDIT LIABILITY:SELLER_PAYABLE ₹950`
  - **Check:** $\text{Debits } (1000) = \text{Credits } (50 + 950)$

- **Seller Settlement Payout (₹950):**
  - `DEBIT LIABILITY:SELLER_PAYABLE ₹950`
  - `CREDIT ASSET:BANK_PAYOUT ₹950`
  - **Check:** $\text{Debits } (950) = \text{Credits } (950)$

- **Full Order Refund (₹1,000):**
  - `DEBIT REVENUE:PLATFORM_COMMISSION ₹50`
  - `DEBIT LIABILITY:SELLER_PAYABLE ₹950`
  - `CREDIT ASSET:GATEWAY_HOLDING ₹1000`
  - **Check:** $\text{Debits } (50 + 950) = \text{Credits } (1000)$

---

## 4. Growth, Promotions & Loyalty Engine

### 4.1 Anti-Abuse Coupons & Discounts
- Promos support percentage (`PERCENTAGE`) or fixed amount (`FIXED_AMOUNT`) discounts.
- Enforced limits: `maxUsagePerUser`, `minOrderAmount`, `expiresAt`, `totalUsageLimit`.
- Single database transaction prevents concurrent over-redemption.

### 4.2 Farmer Referral Loop
- Organic referral loop rewarding both referrer and referee with ₹100 platform credit upon referee's first delivered purchase.

### 4.3 Saved Favorites & "Buy Again" Reorder
- Farmers can favorite products for 1-click retrieval.
- "Buy Again" feature clones past delivered order items into a brand NEW active cart/checkout order flow.

---

## 5. Marketplace Scale & Fair Search Policy

### 5.1 Organic Search & Ranking Algorithm
- Products are ranked purely by relevance, farmer reviews, seller fulfillment rating, and geographical proximity.
- Paid ad placements and hidden pay-to-rank algorithms are explicitly forbidden to protect farmer trust.

### 5.2 Mandatory Seller Compliance
- All chemical inputs (Fertilizers & Insecticides) require verified CIBRC license and state agricultural department approval before listing. Admin acts as sole master compliance authority.
