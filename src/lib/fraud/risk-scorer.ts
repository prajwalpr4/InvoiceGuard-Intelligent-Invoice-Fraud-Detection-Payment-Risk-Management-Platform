import { FraudFinding, RiskAssessment, RiskLevel } from '@/types/database';

export class RiskScoringEngine {
  // Category point weights
  private static WEIGHTS: Record<string, number> = {
    duplicate: 40,
    bank_account: 35,
    splitting: 20,
    vendor: 15,
    purchase_order: 15,
    three_way_match: 20,
    unusual_amount: 15,
    tax_validation: 10,
  };

  /**
   * Evaluates findings and generates an explainable Risk Assessment
   */
  static calculateRisk(
    invoiceId: string,
    orgId: string,
    findings: FraudFinding[]
  ): RiskAssessment {
    let rawScore = 0;
    let hasHardStop = false;
    const scoreBreakdown: RiskAssessment['score_breakdown'] = [];

    // Group findings by category to prevent unfair runaway double-counting
    const categorized = new Map<string, FraudFinding[]>();
    for (const f of findings) {
      if (!categorized.has(f.category)) {
        categorized.set(f.category, []);
      }
      categorized.get(f.category)!.push(f);
      if (f.is_hard_stop) {
        hasHardStop = true;
      }
    }

    // Calculate score with diminishing returns within the same category
    for (const [category, categoryFindings] of categorized.entries()) {
      const baseWeight = this.WEIGHTS[category] || 15;
      // Highest severity in category sets the baseline
      let maxCatPoints = 0;
      for (const finding of categoryFindings) {
        let findingPoints = baseWeight;
        if (finding.severity === 'critical') findingPoints = Math.round(baseWeight * 1.0);
        else if (finding.severity === 'high') findingPoints = Math.round(baseWeight * 0.85);
        else if (finding.severity === 'medium') findingPoints = Math.round(baseWeight * 0.6);
        else findingPoints = Math.round(baseWeight * 0.35);

        if (findingPoints > maxCatPoints) {
          maxCatPoints = findingPoints;
        }

        scoreBreakdown.push({
          category,
          points: findingPoints,
          rule_name: finding.rule_name,
          severity: finding.severity,
        });
      }

      rawScore += maxCatPoints;
    }

    // Normalize and cap between 0 and 100
    const finalScore = Math.min(100, Math.max(0, rawScore));

    // Determine Risk Classification Tier
    let riskLevel: RiskLevel = 'low';
    if (hasHardStop || finalScore >= 60) {
      riskLevel = 'high';
    } else if (finalScore >= 30) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    // Generate explainable plain-English summary
    const explanation = this.generateExplanation(finalScore, riskLevel, hasHardStop, findings);
    const recommendedAction = this.generateRecommendation(riskLevel, hasHardStop, findings);

    return {
      id: `ra_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organization_id: orgId,
      invoice_id: invoiceId,
      risk_score: finalScore,
      risk_level: riskLevel,
      has_hard_stop: hasHardStop,
      score_breakdown: scoreBreakdown,
      explanation,
      recommended_action: recommendedAction,
      evaluated_at: new Date().toISOString(),
    };
  }

  private static generateExplanation(
    score: number,
    level: RiskLevel,
    hasHardStop: boolean,
    findings: FraudFinding[]
  ): string {
    if (findings.length === 0) {
      return 'No suspicious indicators detected. All checks (duplicate hash, registered bank accounts, PO matching, and arithmetic) passed cleanly.';
    }

    const issues = findings.map((f) => f.rule_name).join(', ');
    if (hasHardStop) {
      return `Critical risk override triggered with score ${score}/100. Invoice is flagged with hard-stop conditions: ${issues}. Immediate investigation required prior to any approval.`;
    }

    if (level === 'high') {
      return `High fraud risk assessment (${score}/100). Identified significant issues: ${issues}. Secondary verification and dual-approval required.`;
    }

    if (level === 'medium') {
      return `Moderate risk assessment (${score}/100). Flagged potential discrepancies: ${issues}. Reviewer verification recommended.`;
    }

    return `Low risk assessment (${score}/100). Minor variance noted: ${issues}. Eligible for standard operational approval flow.`;
  }

  private static generateRecommendation(
    level: RiskLevel,
    hasHardStop: boolean,
    findings: FraudFinding[]
  ): string {
    if (hasHardStop) {
      const hasBankIssue = findings.some((f) => f.category === 'bank_account');
      const hasDupIssue = findings.some((f) => f.category === 'duplicate');

      if (hasBankIssue) {
        return 'Place invoice ON HOLD. Do NOT disburse payment. Require the Accounts team to execute an out-of-band telephone verification and submit a verified Bank Change Request.';
      }
      if (hasDupIssue) {
        return 'Place invoice ON HOLD. Check existing invoice archives for double-billing exposure before proceeding.';
      }
      return 'Hold invoice in Investigation Queue. Require escalation to Senior Finance Manager.';
    }

    if (level === 'high') {
      return 'Escalate to Review Queue. Require Department Head and Finance Director approval.';
    }
    if (level === 'medium') {
      return 'Request clarification or proof of delivery from procurement before releasing to standard approval matrix.';
    }
    return 'Clear for standard approval workflow per organization spending policy.';
  }
}

