'use client';

import { useState, type FormEvent } from 'react';
import { X, Receipt, Users, Hash } from 'lucide-react';
import type { Member, SplitMethod } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AddExpenseModalProps {
    eventId: string;
    members: Member[];
    onClose: () => void;
    onAdded: () => void;
}

const SPLIT_METHODS: { value: SplitMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'equal', label: 'หารเท่ากัน', icon: <Users size={16} /> },
    { value: 'select', label: 'เลือกคน', icon: <Users size={16} /> },
    { value: 'custom', label: 'ระบุยอดเอง', icon: <Hash size={16} /> },
];

export default function AddExpenseModal({ eventId, members, onClose, onAdded }: AddExpenseModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(members[0]?.id || '');
    const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
    const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map((m) => m.id));
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleMember = (id: string) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
        );
    };

    // ค่า custom ทั้งหมดที่ user กรอก ใช้เช็คว่ายอดรวมตรงกับ amount มั้ย
    const customTotal = Object.values(customAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);

    const buildSplits = (totalAmount: number): { member_id: string; amount: number }[] | null => {
        if (splitMethod === 'equal') {
            const perPerson = totalAmount / members.length;
            return members.map((m) => ({ member_id: m.id, amount: Math.round(perPerson * 100) / 100 }));
        }

        if (splitMethod === 'select') {
            if (selectedMembers.length === 0) {
                setError('กรุณาเลือกสมาชิกที่ร่วมจ่าย');
                return null;
            }
            const perPerson = totalAmount / selectedMembers.length;
            return selectedMembers.map((mid) => ({ member_id: mid, amount: Math.round(perPerson * 100) / 100 }));
        }

        // custom — validate total matches
        const splits = members
            .filter((m) => customAmounts[m.id] && parseFloat(customAmounts[m.id]) > 0)
            .map((m) => ({ member_id: m.id, amount: Math.round(parseFloat(customAmounts[m.id]) * 100) / 100 }));

        if (Math.abs(customTotal - totalAmount) > 0.5) {
            setError(`ยอดรวมไม่ตรง (ตั้งไว้ ${totalAmount.toFixed(2)} แต่แบ่งได้ ${customTotal.toFixed(2)})`);
            return null;
        }
        return splits;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!description.trim()) { setError('กรุณาใส่ชื่อรายการ'); return; }
        if (!amount || parseFloat(amount) <= 0) { setError('กรุณาใส่จำนวนเงิน'); return; }
        if (!paidBy) { setError('กรุณาเลือกคนจ่าย'); return; }

        const totalAmount = parseFloat(amount);
        const splits = buildSplits(totalAmount);
        if (!splits) return;

        // เติมส่วนต่างจาก rounding ลง split ตัวแรก
        const splitsTotal = splits.reduce((s, sp) => s + sp.amount, 0);
        const diff = Math.round((totalAmount - splitsTotal) * 100) / 100;
        if (diff !== 0 && splits.length > 0) splits[0].amount += diff;

        setLoading(true);
        setError('');

        try {
            const { data: expense, error: expError } = await supabase
                .from('expenses')
                .insert({ event_id: eventId, paid_by: paidBy, description: description.trim(), amount: totalAmount, split_method: splitMethod })
                .select()
                .single();
            if (expError) throw expError;

            const { error: splitError } = await supabase
                .from('expense_splits')
                .insert(splits.map((s) => ({ expense_id: expense.id, ...s })));
            if (splitError) throw splitError;

            onAdded();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* header */}
                <div className="flex items-center justify-between px-7 py-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center">
                            <Receipt size={18} className="text-accent" />
                        </div>
                        <h2 className="text-lg font-bold">เพิ่มค่าใช้จ่าย</h2>
                    </div>
                    <button className="btn-ghost p-1.5" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-7 py-6 flex flex-col gap-5">
                        <div>
                            <label className="field-label">รายการ</label>
                            <input className="input" placeholder="เช่น ค่าพิซซ่า, ค่าเบียร์" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div>
                            <label className="field-label">จำนวนเงิน (บาท)</label>
                            <input className="input text-xl font-semibold" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>

                        <div>
                            <label className="field-label">คนจ่าย</label>
                            <div className="flex flex-wrap gap-2">
                                {members.map((m) => (
                                    <button key={m.id} type="button" className={`chip ${paidBy === m.id ? 'chip-active' : ''}`} onClick={() => setPaidBy(m.id)}>
                                        {m.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="field-label">วิธีหาร</label>
                            <div className="flex gap-2">
                                {SPLIT_METHODS.map((sm) => (
                                    <button
                                        key={sm.value}
                                        type="button"
                                        className={`chip flex-1 justify-center ${splitMethod === sm.value ? 'chip-active' : ''}`}
                                        onClick={() => setSplitMethod(sm.value)}
                                    >
                                        {sm.icon}
                                        {sm.label}
                                    </button>
                                ))}
                            </div>
                            {splitMethod === 'equal' && amount && (
                                <p className="mt-2 text-xs text-txt-tertiary text-center">
                                    คนละ {(parseFloat(amount) / members.length).toFixed(2)} บาท
                                </p>
                            )}
                        </div>

                        {/* ตัวเลือกคนที่ร่วมจ่าย — แสดงเฉพาะ mode "select" */}
                        {splitMethod === 'select' && (
                            <div>
                                <label className="field-label">เลือกคนที่ร่วมจ่าย</label>
                                <div className="flex flex-wrap gap-2">
                                    {members.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            className={`chip ${selectedMembers.includes(m.id) ? 'chip-active' : ''}`}
                                            onClick={() => toggleMember(m.id)}
                                        >
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                                {selectedMembers.length > 0 && amount && (
                                    <p className="mt-2 text-xs text-txt-tertiary">
                                        คนละ {(parseFloat(amount) / selectedMembers.length).toFixed(2)} บาท
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ช่องกรอกยอดแต่ละคน — mode "custom" */}
                        {splitMethod === 'custom' && (
                            <div>
                                <label className="field-label">ระบุยอดแต่ละคน</label>
                                <div className="flex flex-col gap-2">
                                    {members.map((m) => (
                                        <div key={m.id} className="flex items-center gap-3">
                                            <span className="text-sm font-medium flex-1">{m.name}</span>
                                            <input
                                                className="input w-30 text-right"
                                                type="number"
                                                placeholder="0.00"
                                                value={customAmounts[m.id] || ''}
                                                onChange={(e) => setCustomAmounts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {amount && (
                                    <p className={`mt-2 text-xs ${Math.abs(customTotal - parseFloat(amount)) < 0.5 ? 'text-success' : 'text-danger'}`}>
                                        รวม {customTotal.toFixed(2)} / {parseFloat(amount).toFixed(2)} บาท
                                    </p>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="px-3.5 py-2.5 bg-danger-soft text-danger rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="px-7 pb-6 pt-4 flex gap-3 justify-end">
                        <button type="button" className="btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
