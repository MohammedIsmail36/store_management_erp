// ============ أنواع الحسابات ============

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountTypeOption = {
  value: AccountType;
  label: string;
};

export type Account = {
  id: number;
  code: string;
  name: string;
  account_type: AccountType;
  account_type_display: string;
  parent: number | null;
  parent_name: string | null;
  is_active: boolean;
  is_header: boolean;
  allow_manual_entry: boolean;
  opening_balance: number;
  current_balance: number;
  balance_side_display: 'debit' | 'credit';
  children_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AccountTree = Account & {
  children?: AccountTree[];
};

export type AccountFormData = {
  code: string;
  name: string;
  account_type: AccountType;
  parent: number | null;
  is_active: boolean;
  is_header: boolean;
  allow_manual_entry: boolean;
  opening_balance: number;
  notes: string;
};

// ============ أنواع القيود المحاسبية ============

export type JournalEntryStatus = 'draft' | 'posted' | 'cancelled';

export type JournalEntryStatusOption = {
  value: JournalEntryStatus;
  label: string;
};

export type JournalEntryLine = {
  id: number;
  account: number;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string | null;
  cost_center: string | null;
};

export type JournalEntryLineFormData = {
  account: number;
  debit: number;
  credit: number;
  description: string;
  cost_center: string;
};

export type JournalEntry = {
  id: number;
  entry_number: string;
  date: string;
  fiscal_year: number;
  fiscal_year_name: string;
  description: string;
  reference: string | null;
  status: JournalEntryStatus;
  status_display: string;
  total_debit: number;
  total_credit: number;
  lines: JournalEntryLine[];
  created_by: number | null;
  created_by_name: string;
  created_at: string;
  posted_by: number | null;
  posted_by_name: string | null;
  posted_at: string | null;
  cancelled_by: number | null;
  cancelled_by_name: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
};

export type JournalEntryListItem = {
  id: number;
  entry_number: string;
  date: string;
  fiscal_year: number;
  fiscal_year_name: string;
  description: string;
  reference: string | null;
  status: JournalEntryStatus;
  status_display: string;
  total_debit: number;
  total_credit: number;
  lines_count: number;
  created_by: number | null;
  created_by_name: string;
  created_at: string;
};

export type JournalEntryFormData = {
  date: string;
  fiscal_year: number;
  description: string;
  reference: string;
  lines: JournalEntryLineFormData[];
};

// ============ أنواع السنة المالية ============

export type FiscalYear = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_closed: boolean;
  closed_by: number | null;
  closed_by_name: string | null;
  closed_at: string | null;
  created_at: string;
};

export type FiscalYearFormData = {
  name: string;
  start_date: string;
  end_date: string;
};
