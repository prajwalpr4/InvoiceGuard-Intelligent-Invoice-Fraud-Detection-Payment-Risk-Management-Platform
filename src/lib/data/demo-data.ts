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
  id: '00000000-0000-0000-0000-000000000001',
  name: 'InvoiceGuard Workspace',
  slug: 'workspace',
  currency: 'INR',
  tax_identifier: 'GSTIN',
  timezone: 'Asia/Kolkata',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_USERS: Record<string, { profile: Profile; role: string }> = {
  admin: {
    profile: {
      id: '0821301e-9a4a-41cc-b6f4-0cd663e91cf3',
      email: 'admin@invoiceguard.local',
      full_name: 'Administrator',
      job_title: 'System Administrator & CFO',
      department: 'Finance & Compliance',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'admin',
  },
  finance: {
    profile: {
      id: '52961957-4846-4436-a783-afa5d7818ac9',
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
      id: 'cd3d8a1b-2c4a-45d7-9cfe-550c793e3062',
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
      id: '19741721-8bc3-435b-aa84-f8bf4eddd0f6',
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
  id: `00000000-0000-0000-0000-00000000002${i + 1}`,
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
