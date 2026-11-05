import { describe, it, expect } from 'vitest';
import { RiskScoringEngine } from '../src/lib/fraud/risk-scorer';
import { FraudFinding } from '../src/types/database';

describe('RiskScoringEngine', () => {
  it('assigns 0 risk score for invoices with zero fraud findings', () => {
    const assessment = RiskScoringEngine.calculateRisk('inv_clean', 'org_test', []);
    expect(assessment.risk_score).toBe(0);
    expect(assessment.risk_level).toBe('low');
    expect(assessment.has_hard_stop).toBe(false);
  });

  it('enforces hard-stop override flag and marks risk level as high when a critical finding occurs', () => {
    const hardStopFinding: FraudFinding = {
      id: 'ff_test_01',
      organization_id: 'org_test',
      invoice_id: 'inv_01',
      rule_code: 'RULE_BANK_MISMATCH',
      rule_name: 'Unverified Vendor Bank Account',
      category: 'bank_account',
      severity: 'critical',
      is_hard_stop: true,
      evidence: { message: 'Extracted account not in master record' },
      created_at: new Date().toISOString(),
    };

    const assessment = RiskScoringEngine.calculateRisk('inv_01', 'org_test', [hardStopFinding]);
    expect(assessment.has_hard_stop).toBe(true);
    expect(assessment.risk_level).toBe('high');
    expect(assessment.risk_score).toBeGreaterThanOrEqual(35);
  });

  it('caps the risk score at 100 regardless of cumulative point totals', () => {
    const findings: FraudFinding[] = [
      {
        id: 'ff_1',
        organization_id: 'org_test',
        invoice_id: 'inv_multi',
        rule_code: 'RULE_DUPLICATE_EXACT',
        rule_name: 'Duplicate',
        category: 'duplicate',
        severity: 'critical',
        is_hard_stop: true,
        evidence: { message: 'Dup' },
        created_at: new Date().toISOString(),
      },
      {
        id: 'ff_2',
        organization_id: 'org_test',
        invoice_id: 'inv_multi',
        rule_code: 'RULE_BANK_MISMATCH',
        rule_name: 'Bank',
        category: 'bank_account',
        severity: 'critical',
        is_hard_stop: true,
        evidence: { message: 'Bank' },
        created_at: new Date().toISOString(),
      },
      {
        id: 'ff_3',
        organization_id: 'org_test',
        invoice_id: 'inv_multi',
        rule_code: 'RULE_INVOICE_SPLITTING',
        rule_name: 'Splitting',
        category: 'splitting',
        severity: 'high',
        is_hard_stop: false,
        evidence: { message: 'Split' },
        created_at: new Date().toISOString(),
      },
      {
        id: 'ff_4',
        organization_id: 'org_test',
        invoice_id: 'inv_multi',
        rule_code: 'RULE_THREE_WAY_MATCH',
        rule_name: 'GRN',
        category: 'three_way_match',
        severity: 'high',
        is_hard_stop: true,
        evidence: { message: 'GRN' },
        created_at: new Date().toISOString(),
      },
    ];

    const assessment = RiskScoringEngine.calculateRisk('inv_multi', 'org_test', findings);
    expect(assessment.risk_score).toBeLessThanOrEqual(100);
    expect(assessment.risk_level).toBe('high');
  });
});

