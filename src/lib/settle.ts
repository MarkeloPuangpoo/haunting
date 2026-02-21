import type { Member, Expense, ExpenseSplit, Settlement } from './types';

/**
 * Debt Simplification Algorithm
 * 
 * 1. คำนวณ net balance ของแต่ละคน (จ่ายจริง - ส่วนที่ต้องรับผิดชอบ)
 * 2. แยกเป็นกลุ่มคนติดหนี้ (negative) กับคนที่ถูกติดหนี้ (positive)
 * 3. จับคู่หักลบจนหมด → ลดจำนวน transactions
 */
export function calculateSettlements(
    members: Member[],
    expenses: Expense[],
    splits: ExpenseSplit[]
): Settlement[] {
    // Step 1: Calculate net balance for each member
    const balances = new Map<string, number>();

    members.forEach((m) => balances.set(m.id, 0));

    // Add what each person paid
    expenses.forEach((expense) => {
        const current = balances.get(expense.paid_by) || 0;
        balances.set(expense.paid_by, current + expense.amount);
    });

    // Subtract what each person owes
    splits.forEach((split) => {
        const current = balances.get(split.member_id) || 0;
        balances.set(split.member_id, current - split.amount);
    });

    // Step 2: Separate into creditors (positive) and debtors (negative)
    const creditors: { member: Member; amount: number }[] = [];
    const debtors: { member: Member; amount: number }[] = [];

    members.forEach((member) => {
        const balance = balances.get(member.id) || 0;
        // Round to avoid floating point issues
        const rounded = Math.round(balance * 100) / 100;
        if (rounded > 0.01) {
            creditors.push({ member, amount: rounded });
        } else if (rounded < -0.01) {
            debtors.push({ member, amount: Math.abs(rounded) });
        }
    });

    // Sort descending by amount for optimal pairing
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Step 3: Greedy matching to minimize transactions
    const settlements: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const settleAmount = Math.min(debtor.amount, creditor.amount);

        if (settleAmount > 0.01) {
            settlements.push({
                from: debtor.member,
                to: creditor.member,
                amount: Math.round(settleAmount * 100) / 100,
            });
        }

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return settlements;
}

/**
 * คำนวณสรุปยอดแต่ละคน
 */
export function calculateMemberSummary(
    memberId: string,
    expenses: Expense[],
    splits: ExpenseSplit[]
): { totalPaid: number; totalOwed: number; net: number } {
    const totalPaid = expenses
        .filter((e) => e.paid_by === memberId)
        .reduce((sum, e) => sum + e.amount, 0);

    const totalOwed = splits
        .filter((s) => s.member_id === memberId)
        .reduce((sum, s) => sum + s.amount, 0);

    return {
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalOwed: Math.round(totalOwed * 100) / 100,
        net: Math.round((totalPaid - totalOwed) * 100) / 100,
    };
}
