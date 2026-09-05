// ============================================================
// REVIVE X — Audit Log Helper
// Creates audit records in MongoDB (or in-memory fallback)
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { AuditLogModel } from '../models/AuditLog.js';
import { isMongoConnected } from '../config/db.js';
import type { AuditEventType, Actor, PolicyResult } from '@revive-x/shared';

// In-memory fallback store when MongoDB is unavailable
const inMemoryAuditLog: InMemoryAuditEntry[] = [];

interface InMemoryAuditEntry {
  auditId: string;
  timestamp: Date;
  transactionId: string;
  eventType: AuditEventType;
  actor: Actor;
  action: string;
  reason: string;
  policyResult: PolicyResult | null;
  amount: number;
  status: string;
  metadata: Record<string, unknown>;
}

export interface CreateAuditParams {
  transactionId: string;
  eventType: AuditEventType;
  actor: Actor;
  action: string;
  reason: string;
  policyResult?: PolicyResult | null;
  amount?: number;
  status: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditEntry(params: CreateAuditParams): Promise<void> {
  const entry: InMemoryAuditEntry = {
    auditId: uuidv4(),
    timestamp: new Date(),
    transactionId: params.transactionId,
    eventType: params.eventType,
    actor: params.actor,
    action: params.action,
    reason: params.reason,
    policyResult: params.policyResult ?? null,
    amount: params.amount ?? 0,
    status: params.status,
    metadata: params.metadata ?? {},
  };

  if (isMongoConnected()) {
    try {
      await AuditLogModel.create(entry);
      return;
    } catch (err) {
      console.warn('[Audit] MongoDB write failed, using in-memory fallback', err);
    }
  }

  // In-memory fallback
  inMemoryAuditLog.unshift(entry);
  // Keep max 10000 entries in memory
  if (inMemoryAuditLog.length > 10000) {
    inMemoryAuditLog.splice(10000);
  }
}

export interface AuditQueryParams {
  transactionId?: string;
  eventType?: AuditEventType;
  actor?: Actor;
  policyResult?: PolicyResult;
  page?: number;
  pageSize?: number;
}

export interface AuditQueryResult {
  items: InMemoryAuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function queryAuditLog(params: AuditQueryParams): Promise<AuditQueryResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(500, Math.max(1, params.pageSize ?? 50));
  const skip = (page - 1) * pageSize;

  if (isMongoConnected()) {
    try {
      const filter: Record<string, unknown> = {};
      if (params.transactionId) filter['transactionId'] = params.transactionId;
      if (params.eventType) filter['eventType'] = params.eventType;
      if (params.actor) filter['actor'] = params.actor;
      if (params.policyResult) filter['policyResult'] = params.policyResult;

      const [items, total] = await Promise.all([
        AuditLogModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(pageSize).lean(),
        AuditLogModel.countDocuments(filter),
      ]);

      return {
        items: items as unknown as InMemoryAuditEntry[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (err) {
      console.warn('[Audit] MongoDB query failed, using in-memory fallback', err);
    }
  }

  // In-memory fallback
  let filtered = [...inMemoryAuditLog];
  if (params.transactionId) {
    filtered = filtered.filter((e) => e.transactionId === params.transactionId);
  }
  if (params.eventType) {
    filtered = filtered.filter((e) => e.eventType === params.eventType);
  }
  if (params.actor) {
    filtered = filtered.filter((e) => e.actor === params.actor);
  }
  if (params.policyResult) {
    filtered = filtered.filter((e) => e.policyResult === params.policyResult);
  }

  const total = filtered.length;
  const items = filtered.slice(skip, skip + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function getInMemoryAuditLog(): InMemoryAuditEntry[] {
  return inMemoryAuditLog;
}

export function clearInMemoryAuditLog(): void {
  inMemoryAuditLog.splice(0);
}
