import {
  Organization,
  Profile,
  OrganizationMember,
  Vendor,
  VendorBankAccount,
  PurchaseOrder,
  GoodsReceipt,
  Invoice,
  FraudFinding,
  PaymentRecord,
  Notification,
  AuditLog,
} from '@/types/database';

export const DEMO_ORG: Organization = {
  id: 'org_enterprise_01',
  name: 'InvoiceGuard Workspace',
  slug: 'workspace',
  currency: 'USD',
  tax_identifier: 'TAX_ID',
  timezone: 'UTC',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_USERS: Record<string, { profile: Profile; role: string }> = {
  admin: {
    profile: {
      id: 'usr_admin_01',
      email: 'admin@invoiceguard.local',
      full_name: 'Administrator',
      job_title: 'System Administrator',
      department: 'Finance & Compliance',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'admin',
  },
  finance: {
    profile: {
      id: 'usr_finance_01',
      email: 'finance@invoiceguard.local',
      full_name: 'Finance Specialist',
      job_title: 'Accounts Payable Officer',
      department: 'Finance Operations',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'finance',
  },
  approver: {
    profile: {
      id: 'usr_approver_01',
      email: 'approver@invoiceguard.local',
      full_name: 'Finance Approver',
      job_title: 'Finance Director & Approver',
      department: 'Financial Control',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'approver',
  },
  auditor: {
    profile: {
      id: 'usr_auditor_01',
      email: 'auditor@invoiceguard.local',
      full_name: 'Compliance Auditor',
      job_title: 'Internal Audit Lead',
      department: 'Internal Audit',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'auditor',
  },
};

export const DEMO_MEMBERS: OrganizationMember[] = Object.values(DEMO_USERS).map((u, i) => ({
  id: `member_0${i + 1}`,
  organization_id: DEMO_ORG.id,
  user_id: u.profile.id,
  role: u.role as any,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  profile: u.profile,
}));

// Clean Baseline: No pre-seeded mock business transactions
export const DEMO_VENDORS: Vendor[] = [];
export const DEMO_BANK_ACCOUNTS: VendorBankAccount[] = [];
export const DEMO_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const DEMO_GOODS_RECEIPTS: GoodsReceipt[] = [];
export const DEMO_INVOICES: Invoice[] = [];
export const DEMO_FRAUD_FINDINGS: FraudFinding[] = [];
export const DEMO_PAYMENTS: PaymentRecord[] = [];
export const DEMO_NOTIFICATIONS: Notification[] = [];
export const DEMO_AUDIT_LOGS: AuditLog[] = [];
