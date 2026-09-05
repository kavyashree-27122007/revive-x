# REVIVE X — AI Revenue Recovery Intelligence & Orchestration
> **Razorpay AI Buildathon — Track 03: "Find revenue that's slipping away and win it back."**

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.x-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.x-646cff.svg)](https://vitejs.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-blueviolet.svg)](https://razorpay.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-1.5%20Pro-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Tests](https://img.shields.io/badge/Tests-29%2F29%20Passing-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Executive Summary

**REVIVE X** is a production-grade AI Revenue Recovery Decision and Orchestration Engine. 

Rather than blindly retrying failed transactions or spamming customers with aggressive discount links, REVIVE X optimizes **Expected Net Recovery** within strict merchant-defined policy guardrails. It diagnoses revenue leakage, calculates recovery probabilities using multi-factor mathematical models, evaluates 8 candidate strategies, enforces policy constraints via the **Guardian Engine**, executes payment recovery via **Razorpay Test Mode**, and provides a 100% explainable 10-step audit trail.

---

## 🏗️ System Architecture

```
                                  REVIVE X ARCHITECTURE
                                  
   +-----------------------------------------------------------------------------------+
   |                                 REACT 18 FRONTEND                                 |
   |   Command Center | Revenue Radar | AI Decisions | Simulator | Policies | Audit    |
   +-----------------------------------------+-----------------------------------------+
                                             |  REST API (Axios + JSON)
                                             v
   +-----------------------------------------------------------------------------------+
   |                              EXPRESS 5 NODE.JS SERVER                             |
   |                                                                                   |
   |   +-----------------------+   +------------------------+   +-------------------+  |
   |   | Probability Calculator|   |  Intervention Scorer   |   |  Guardian Engine  |  |
   |   | Factor-Weighted Score |   | Expected Net Recovery  |   | 9 Policy Rules    |  |
   |   +-----------+-----------+   +-----------+------------+   +---------+---------+  |
   |               |                       |                          |                |
   |               +-----------------------+--------------------------+                |
   |                                       |                                           |
   |                                       v                                           |
   |   +-----------------------------------+-----------------------------------+       |
   |   |                        AI PROVIDER ABSTRACTION                        |       |
   |   |    Google Gemini 1.5 Pro  <--->  Deterministic Fallback Engine       |       |
   |   +-----------------------------------+-----------------------------------+       |
   +---------------------------------------+-------------------------------------------+
                                           |
            +------------------------------+------------------------------+
            |                                                             |
            v                                                             v
+-----------------------+                                     +-----------------------+
|  RAZORPAY TEST MODE   |                                     |    MONGODB / IN-MEM   |
| Order Link & Webhooks |                                     | Transactions & Audit  |
+-----------------------+                                     +-----------------------+
```

---

## ✨ Key Features & Capabilities

### 1. Revenue Risk Radar 📡
Detects and categorizes 6 distinct types of revenue leakage:
- **`payment_failure`**: Temporary gateway timeouts or insufficient funds.
- **`checkout_abandonment`**: Cart drop-offs during final payment selection.
- **`subscription_failure`**: Recurring billing authorization fails.
- **`invoice_overdue`**: Unpaid B2B invoice past grace period.
- **`repeated_failure`**: Multiple consecutive failed retry attempts.
- **`high_value_at_risk`**: High-AOV transactions at risk of churn.

### 2. Deterministic Probability Engine 📊
Calculates factor-weighted recovery probability $P_{\text{recovery}} \in [0.0, 1.0]$ based on empirical metrics:
- **Customer Success Rate** (30% weight): Historical success ratio.
- **Failure Category** (25% weight): Temporary technical issue vs. permanent decline.
- **Retry Penalty** (20% weight): Exponential decay for repeated attempts.
- **Age Decay** (15% weight): Time elapsed since transaction failure.
- **Leakage Type Score** (10% weight): Specific baseline recovery propensity.

### 3. Intervention Scoring Engine 🎯
Evaluates 8 strategy candidates against expected net recovery:
1. `immediate_retry` (Instant retry for transient errors)
2. `delayed_retry` (Optimal time window delay)
3. `payment_reminder` (Low-friction SMS/Email alert)
4. `payment_link` (Razorpay Test Mode hosted checkout link)
5. `personalized_message` (Tailored customer re-engagement)
6. `merchant_incentive` (Discount/cashback offer within policy limits)
7. `escalation` (Flagged for human merchant review)
8. `stop` (Cease intervention to save customer contact budget)

$$\text{Expected Net Recovery} = (\text{Amount} \times P_{\text{recovery}}) - \text{Intervention Cost} - \text{Annoyance Penalty}$$

### 4. Guardian Policy Engine 🛡️
Enforces 9 strict merchant guardrails, returning `APPROVED`, `BLOCKED`, `ESCALATED`, or `STOPPED`:
- **`maximumRetryAttempts`**: Block retries when exceeded (e.g. max 2 retries).
- **`maximumDiscountPercentage`**: Block excessive incentives (e.g. max 10%). On block, the AI pivots to a compliant alternative strategy.
- **`maximumAutonomousTransactionAmount`**: Escalate high-value actions exceeding threshold (e.g. > ₹10,000).
- **`maximumRecoveryWindowHours`**: Cease retries on stale transactions (> 48 hours).
- **`minimumRecoveryProbability`**: Auto-stop interventions when $P_{\text{recovery}} < 0.25$.

### 5. Razorpay Integration & Webhook Verification 💳
- **Test Mode Execution**: Server-side order creation using official `@razorpay/razorpay` SDK.
- **HMAC-SHA256 Verification**: Verifies `X-Razorpay-Signature` headers using `crypto.timingSafeEqual` to avoid timing attacks.
- **Mock Mode Fallback**: Automatically activates a clearly labelled **MOCK MODE** banner when Razorpay credentials are absent, guaranteeing zero-crash developer onboarding.
- **Strict Anti-Fraud Guarantee**: Never fakes Razorpay payment success. Frontend payment status claims are ignored until verified server-side.

### 6. What-If Recovery Simulator 🧪
Simulates 5 distinct recovery strategies side-by-side across real transaction data:
- **Strategy A**: Immediate Retry
- **Strategy B**: Delayed Retry
- **Strategy C**: Reminder Sequence
- **Strategy D**: Incentive Strategy
- **Strategy E**: Smart Segmented Recovery (AI-Selected Optimal)

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Modern, high-performance UI SPA |
| **Styling & Motion** | Tailwind CSS, Framer Motion | Dynamic visual feedback & layout |
| **Data Viz** | Recharts, Lucide Icons | Financial funnels & risk charts |
| **Backend API** | Node.js 20, Express 5 | RESTful server architecture |
| **Database** | MongoDB + Mongoose | Zero-config in-memory Map fallback |
| **Payment Gateway**| Razorpay Node SDK | Test mode orders & HMAC webhooks |
| **AI Provider** | Google Gemini 1.5 Pro | AI diagnosis + deterministic fallback |
| **Testing** | Vitest | 29 unit & integration tests |
| **Monorepo** | npm Workspaces | Shared TypeScript interfaces & schemas |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/revive-x.git
cd revive-x

# 2. Install dependencies across all monorepo workspaces
npm run install:all
```

### Running the Application

```bash
# Start both Backend (Port 3001) and Frontend (Port 5173 / 5174) concurrently
npm run dev
```

- 💻 **Frontend Application**: `http://localhost:5174` (or `http://localhost:5173`)
- 🔌 **Backend REST API**: `http://localhost:3001/api`
- 🩺 **Health Check Endpoint**: `http://localhost:3001/api/health`

### Environment Configuration (Optional)

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Razorpay Test Credentials (Optional — runs in MOCK MODE if omitted)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx

# AI Credentials (Optional — uses Deterministic Engine if omitted)
GEMINI_API_KEY=xxxx

# Database Connection (Optional — uses In-Memory Store if omitted)
MONGODB_URI=mongodb://localhost:27017/revivex
```

---

## 🧪 Testing & Quality Assurance

REVIVE X includes a complete unit test suite verifying financial math, policy enforcement, signature verification, and AI fallback behavior.

```bash
# Run Vitest test suite (29 tests)
npm test

# Run TypeScript type check across shared, server, client
npm run typecheck

# Run ESLint across codebases
npm run lint

# Run production build validation
npm run build
```

---

## 💡 Critical Demo Scenarios

The pre-seeded demo dataset includes targeted scenario cases designed for presentation:

1. **`TXN-DEMO-9999` (Blocked Policy Violation)**:
   - AI initially proposes a 25% merchant discount.
   - Guardian Engine catches violation (`maxDiscountPercentage = 10%`) and marks action `BLOCKED`.
   - AI automatically selects compliant alternative (`delayed_retry`), which receives `APPROVED` status.
2. **`TXN-DEMO-9998` (High-Value Escalation)**:
   - Transaction value of ₹45,000 exceeds autonomous threshold (₹10,000).
   - Marked `ESCALATED` for merchant approval.
3. **`TXN-DEMO-9999` / Low Prob (`TXN-DEMO-9997`) (STOP Decision)**:
   - Transaction with low success history and excessive age.
   - Guardian assigns `STOPPED` status to preserve customer contact budget.
4. **`TXN-DEMO-9996` (Checkout Recovery & Webhook Verification)**:
   - Generates Razorpay checkout payment link and validates return signature via HMAC-SHA256.

---

## 📁 Repository Structure

```
revive-x/
├── client/                     # Frontend SPA (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # KPICards, AIDecisionDrawer, DemoGuideModal
│   │   ├── pages/              # 8 Application Views (CommandCenter, Radar, etc.)
│   │   └── lib/                # API Client & Number Formatter (INR ₹)
├── server/                     # Backend Node.js Express Application
│   ├── src/
│   │   ├── config/             # DB & Razorpay initializers
│   │   ├── engines/            # Guardian, Probability, Scoring & AI engines
│   │   ├── routes/             # REST Endpoints & Webhook Receiver
│   │   └── __tests__/          # 7 Vitest test suites (29 tests)
├── shared/                     # Shared TypeScript domain models & schemas
│   └── src/
│       ├── types/              # Domain interfaces
│       ├── schemas/            # Zod validation schemas
│       └── constants/          # Status & Intervention enums
├── .env.example                # Documented environment variables
├── package.json                # Root npm workspace configuration
└── README.md                   # System documentation
```

---

## 📜 License

This project is licensed under the **MIT License**.

---

<p align="center">
  <b>Built for Razorpay AI Buildathon 2026</b> • Track 03: Revenue Recovery Intelligence
</p>
