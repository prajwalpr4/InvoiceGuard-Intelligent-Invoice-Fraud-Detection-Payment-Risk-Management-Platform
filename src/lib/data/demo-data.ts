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
      id: '4edea32e-a42e-4bb7-99f8-d53f493f3ac3',
      email: 'alex.morgan@acmeglobal.com',
      full_name: 'Alex Morgan',
      job_title: 'Chief Financial Officer & Admin',
      department: 'Executive Finance',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'admin',
  },
  finance: {
    profile: {
      id: 'e4fc6fce-8142-4d1e-8008-af8bd0b3adf6',
      email: 'priya.sharma@acmeglobal.com',
      full_name: 'Priya Sharma',
      job_title: 'Accounts Payable Specialist',
      department: 'Finance Operations',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'finance',
  },
  approver: {
    profile: {
      id: '86026519-6494-4652-91db-7c8e8998742d',
      email: 'marcus.chen@acmeglobal.com',
      full_name: 'Marcus Chen',
      job_title: 'Finance Director & Approver',
      department: 'Financial Control',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    role: 'approver',
  },
  auditor: {
    profile: {
      id: 'd04a083b-febf-438c-a3f7-d248910afa31',
      email: 'sarah.jenkins@acmeglobal.com',
      full_name: 'Sarah Jenkins',
      job_title: 'Internal Audit & Compliance Lead',
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
