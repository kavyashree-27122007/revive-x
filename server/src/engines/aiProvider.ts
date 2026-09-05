// ============================================================
// REVIVE X — AI Provider Abstraction
// Gemini when available; deterministic engine as fallback.
// Never crashes the app if AI is unavailable.
import type { ITransaction } from '../models/Transaction.js';
import type { IMerchantPolicy } from '../models/MerchantPolicy.js';
import type { AIAnalysis, InterventionType } from '@revive-x/shared';
import { analyzeTransactionDeterministic, generateExplanation } from './deterministicEngine.js';
import { scoreInterventions } from './interventionScorer.js';
import { calculateRecoveryProbability } from './probabilityCalculator.js';

// ── AI Provider interface ─────────────────────────────────
export interface AIProvider {
  analyzeTransaction(tx: ITransaction, policy: IMerchantPolicy): Promise<AIAnalysis>;
  generateExplanation(
    tx: ITransaction,
    selectedIntervention: InterventionType,
    policy: IMerchantPolicy
  ): Promise<string>;
  getProviderName(): 'gemini' | 'deterministic_engine';
}

// ── Gemini Provider ───────────────────────────────────────
class GeminiProvider implements AIProvider {
  private model: import('@google/generative-ai').GenerativeModel;

  constructor(model: import('@google/generative-ai').GenerativeModel) {
    this.model = model;
  }

  getProviderName(): 'gemini' {
    return 'gemini';
  }

  async analyzeTransaction(tx: ITransaction, policy: IMerchantPolicy): Promise<AIAnalysis> {
    // Run deterministic engine first to get structured data
    const deterministicResult = analyzeTransactionDeterministic(tx, policy);

    // Use Gemini to enhance the explanation
    try {
      const enhancedExplanation = await this.generateExplanation(
        tx,
        deterministicResult.selectedIntervention,
        policy
      );
      return {
        ...deterministicResult,
        explanation: enhancedExplanation,
        proposedBy: 'gemini',
      };
    } catch {
      // Fallback to deterministic explanation
      return deterministicResult;
    }
  }

  async generateExplanation(
    tx: ITransaction,
    selectedIntervention: InterventionType,
    policy: IMerchantPolicy
  ): Promise<string> {
    const recoveryProbability = calculateRecoveryProbability(tx);
    const candidates = scoreInterventions(tx, recoveryProbability);
    const selected = candidates.find((c) => c.type === selectedIntervention);

    const prompt = `You are a Revenue Recovery AI for a fintech platform called REVIVE X.
Provide a concise 2-3 sentence business explanation for why the following recovery strategy was selected.
Do NOT make things up. Use only the data provided below.

Transaction:
- Amount: ₹${tx.amount.toFixed(0)}
- Status: ${tx.paymentStatus}
- Failure reason: ${tx.failureReason ?? 'unknown'}
- Retry count: ${tx.retryCount}
- Customer success rate: ${tx.customerHistory.totalTransactions > 0 ? ((tx.customerHistory.successfulTransactions / tx.customerHistory.totalTransactions) * 100).toFixed(1) : 0}%
- Leakage type: ${tx.leakageType ?? 'unknown'}

Selected Strategy: ${selectedIntervention}
Recovery Probability: ${(recoveryProbability * 100).toFixed(1)}%
Expected Net Recovery: ₹${(selected?.expectedNetRecovery ?? 0).toFixed(0)}
Maximum Allowed Discount: ${policy.maximumDiscountPercentage}%

Respond with only the explanation text. No headers, no bullet points. 2-3 sentences maximum.`;

    const result = await Promise.race([
      this.model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 8000)
      ),
    ]);

    const text = result.response.text().trim();
    return text || generateExplanation(tx, selectedIntervention, candidates, policy);
  }
}

// ── Deterministic Fallback Provider ──────────────────────
class DeterministicProvider implements AIProvider {
  getProviderName(): 'deterministic_engine' {
    return 'deterministic_engine';
  }

  async analyzeTransaction(tx: ITransaction, policy: IMerchantPolicy): Promise<AIAnalysis> {
    return analyzeTransactionDeterministic(tx, policy);
  }

  async generateExplanation(
    tx: ITransaction,
    selectedIntervention: InterventionType,
    policy: IMerchantPolicy
  ): Promise<string> {
    const recoveryProbability = calculateRecoveryProbability(tx);
    const candidates = scoreInterventions(tx, recoveryProbability);
    return generateExplanation(tx, selectedIntervention, candidates, policy);
  }
}

// ── Singleton provider instance ───────────────────────────
let providerInstance: AIProvider | null = null;

export async function createAIProvider(): Promise<AIProvider> {
  if (providerInstance) return providerInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'xxxx') {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Verify connectivity with a minimal test
      await Promise.race([
        model.generateContent('ping'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection test timeout')), 5000)
        ),
      ]);

      providerInstance = new GeminiProvider(model);
      console.info('[AI] Using Gemini provider');
    } catch (err) {
      console.warn('[AI] Gemini unavailable — using deterministic engine', err);
      providerInstance = new DeterministicProvider();
    }
  } else {
    console.info('[AI] No Gemini API key — using deterministic engine');
    providerInstance = new DeterministicProvider();
  }

  return providerInstance;
}

export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    console.warn('[AI] Provider not initialized — creating deterministic fallback');
    providerInstance = new DeterministicProvider();
  }
  return providerInstance;
}

export function resetAIProvider(): void {
  providerInstance = null;
}
