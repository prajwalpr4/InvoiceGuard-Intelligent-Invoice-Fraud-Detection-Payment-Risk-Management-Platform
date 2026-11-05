export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'finance' | 'approver' | 'auditor' | 'vendor';
export type MemberStatus = 'active' | 'pending' | 'suspended';

export type InvoiceProcessingStatus =
  | 'uploaded'
  | 'processing'
  | 'extracted'
  | 'needs_correction'
  | 'failed';

export type InvoiceWorkflowStatus =
  | 'draft'
  | 'pending_review'
  | 'on_hold'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'ready_for_payment'
  | 'partially_paid'
  | 'paid'
  | 'archived';

export type RiskLevel = 'low' | 'medium' | 'high';
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalDecision =
  | 'approve'
  | 'reject'
  | 'hold'
  | 'escalate'
  | 'request_verification';

export type PaymentMethod =
  | 'bank_transfer'
  | 'neft_rtgs'
  | 'ach'
  | 'wire'
  | 'check'
  | 'upi';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: string;
  tax_identifier: string; // GSTIN / EIN / VAT
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string; // matches auth.users.id
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  job_title?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface VendorBankAccount {
  id: string;
  organization_id: string;
  vendor_id: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch?: string | null;
  account_type: 'current' | 'savings';
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  organization_id: string;
  vendor_code: string;
  name: string;
  legal_name?: string | null;
  tax_id: string; // GSTIN / EIN
  pan_number?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  postal_code?: string | null;
  status: 'active' | 'inactive' | 'flagged';
  verification_status: 'verified' | 'unverified' | 'pending';
  risk_tier: 'low' | 'medium' | 'high';
  first_invoice_date?: string | null;
  last_invoice_date?: string | null;
  total_invoices_count: number;
  total_amount_paid: number;
  created_at: string;
  updated_at: string;
  bank_accounts?: VendorBankAccount[];
}

export interface VendorBankChangeRequest {
  id: string;
  organization_id: string;
  vendor_id: string;
  requested_by_id: string;
  reviewed_by_id?: string | null;
  old_account_number?: string | null;
  old_ifsc?: string | null;
  new_bank_name: string;
  new_account_number: string;
  new_ifsc_code: string;
  supporting_doc_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface InvoiceFile {
  id: string;
  organization_id: string;
  invoice_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  page_count: number;
  created_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  item_code?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

export interface InvoiceExtraction {
  id: string;
  invoice_id: string;
  raw_text: string;
  extracted_fields: {
    vendor_name?: { value: string; confidence: number };
    vendor_address?: { value: string; confidence: number };
    gstin?: { value: string; confidence: number };
    pan?: { value: string; confidence: number };
    invoice_number?: { value: string; confidence: number };
    invoice_date?: { value: string; confidence: number };
    due_date?: { value: string; confidence: number };
    po_number?: { value: string; confidence: number };
    subtotal?: { value: number; confidence: number };
    tax_amount?: { value: number; confidence: number };
    cgst?: { value: number; confidence: number };
    sgst?: { value: number; confidence: number };
    igst?: { value: number; confidence: number };
    total_amount?: { value: number; confidence: number };
    bank_account_number?: { value: string; confidence: number };
    ifsc_code?: { value: string; confidence: number };
    bank_name?: { value: string; confidence: number };
  };
  overall_confidence: number;
  is_verified_by_user: boolean;
  verified_by_id?: string | null;
  verified_at?: string | null;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  vendor_id: string;
  po_number: string;
  issue_date: string;
  expected_delivery_date?: string | null;
  total_amount: number;
  billed_amount: number;
  remaining_amount: number;
  currency: string;
  status: 'open' | 'partially_billed' | 'fully_billed' | 'closed' | 'cancelled';
  department: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  line_items?: POLineItem[];
}

export interface POLineItem {
  id: string;
  po_id: string;
  item_code?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export interface GoodsReceipt {
  id: string;
  organization_id: string;
  po_id: string;
  grn_number: string;
  received_date: string;
  received_by_id: string;
  notes?: string | null;
  created_at: string;
  items?: GoodsReceiptItem[];
  purchase_order?: PurchaseOrder;
}

export interface GoodsReceiptItem {
  id: string;
  grn_id: string;
  po_line_item_id?: string | null;
  description: string;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
  rejection_notes?: string | null;
}

export interface FraudRule {
  id: string;
  organization_id: string;
  rule_code: string;
  name: string;
  description: string;
  category:
    | 'duplicate'
    | 'bank_account'
    | 'splitting'
    | 'vendor'
    | 'purchase_order'
    | 'three_way_match'
    | 'unusual_amount'
    | 'tax_validation';
  is_enabled: boolean;
  is_hard_stop: boolean;
  score_weight: number;
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FraudFinding {
  id: string;
  organization_id: string;
  invoice_id: string;
  rule_id?: string | null;
  rule_code: string;
  rule_name: string;
  category: string;
  severity: FindingSeverity;
  is_hard_stop: boolean;
  evidence: {
    message: string;
    fields?: string[];
    expected?: any;
    actual?: any;
    matched_invoice_id?: string;
    matched_invoice_number?: string;
    matched_vendor_id?: string;
    details?: Record<string, any>;
  };
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  organization_id: string;
  invoice_id: string;
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  has_hard_stop: boolean;
  score_breakdown: {
    category: string;
    points: number;
    rule_name: string;
    severity: FindingSeverity;
  }[];
  explanation: string;
  recommended_action: string;
  evaluated_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  vendor_id?: string | null;
  po_id?: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  currency: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  department?: string | null;
  category?: string | null;
  notes?: string | null;
  processing_status: InvoiceProcessingStatus;
  workflow_status: InvoiceWorkflowStatus;
  risk_score: number;
  risk_level: RiskLevel;
  has_hard_stop: boolean;
  submitted_by_id: string;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  purchase_order?: PurchaseOrder;
  files?: InvoiceFile[];
  line_items?: InvoiceLineItem[];
  extraction?: InvoiceExtraction;
  findings?: FraudFinding[];
  risk_assessment?: RiskAssessment;
}

export interface ReviewAssignment {
  id: string;
  organization_id: string;
  invoice_id: string;
  assigned_to_id: string;
  assigned_by_id: string;
  due_date?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalPolicy {
  id: string;
  organization_id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  required_roles: UserRole[];
  step_order: number;
  is_active: boolean;
}

export interface ApprovalRequest {
  id: string;
  organization_id: string;
  invoice_id: string;
  current_step: number;
  total_steps: number;
  status: 'pending' | 'approved' | 'rejected' | 'held';
  created_at: string;
  updated_at: string;
  steps?: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  approval_request_id: string;
  step_number: number;
  required_role: UserRole;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  action_by_id?: string | null;
  action_at?: string | null;
  action_reason?: string | null;
}

export interface PaymentRecord {
  id: string;
  organization_id: string;
  invoice_id: string;
  payment_reference: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_date: string;
  status: PaymentStatus;
  bank_account_used?: string | null;
  recorded_by_id: string;
  notes?: string | null;
  created_at: string;
  invoice?: Invoice;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  entity_type?: 'invoice' | 'vendor' | 'approval' | 'payment' | 'user';
  entity_id?: string | null;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_state?: Record<string, any> | null;
  new_state?: Record<string, any> | null;
  reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface InvoiceComment {
  id: string;
  organization_id: string;
  invoice_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  organization_id: string;
  key: string;
  value: Json;
  updated_at: string;
}

export interface ProcessingJob {
  id: string;
  organization_id: string;
  job_type: 'bulk_upload' | 'ocr_extract' | 'fraud_reanalyze';
  status: 'queued' | 'running' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  failed_items: number;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
}

