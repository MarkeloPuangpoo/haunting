export type SplitMethod = 'equal' | 'select' | 'custom';

export interface Event {
  id: string;
  name: string;
  created_at: string;
  owner_id?: string;
}

export interface Member {
  id: string;
  event_id: string;
  name: string;
  promptpay_id: string | null;
}

export interface Expense {
  id: string;
  event_id: string;
  paid_by: string;
  description: string;
  amount: number;
  split_method: SplitMethod;
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
}

export interface Settlement {
  from: Member;
  to: Member;
  amount: number;
}

export interface ExpenseWithDetails extends Expense {
  payer?: Member;
  splits?: (ExpenseSplit & { member?: Member })[];
}
