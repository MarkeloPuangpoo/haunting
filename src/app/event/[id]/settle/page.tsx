'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateSettlements, calculateMemberSummary } from '@/lib/settle';
import { generatePromptPayPayload } from '@/lib/promptpay';
import type { Member, Expense, ExpenseSplit, Settlement } from '@/lib/types';
import QRCode from '@/components/QRCode';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Wallet, TrendingDown, TrendingUp } from 'lucide-react';

export default function SettlePage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [eventName, setEventName] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [splits, setSplits] = useState<ExpenseSplit[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [expandedQR, setExpandedQR] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!eventId) return;

        try {
            const [eventRes, membersRes, expensesRes, splitsRes] = await Promise.all([
                supabase.from('events').select('name').eq('id', eventId).single(),
                supabase.from('members').select('*').eq('event_id', eventId),
                supabase.from('expenses').select('*').eq('event_id', eventId),
                supabase.from('expense_splits').select('*, expenses!inner(event_id)').eq('expenses.event_id', eventId),
            ]);

            if (eventRes.data) setEventName(eventRes.data.name);
            if (membersRes.data && expensesRes.data && splitsRes.data) {
                setMembers(membersRes.data);
                setExpenses(expensesRes.data);
                setSplits(splitsRes.data);
                setSettlements(calculateSettlements(membersRes.data, expensesRes.data, splitsRes.data));
            }
        } catch (error) {
            console.error('Error fetching settlement data:', error);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (loading) {
        return (
            <div className="mesh-bg min-h-dvh flex items-center justify-center">
                <div className="float-element text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[image:var(--accent-gradient)]" />
                    <p className="text-txt-tertiary">กำลังคำนวณ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mesh-bg min-h-dvh">
            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* header */}
                <div className="flex items-center gap-3 mb-8">
                    <button className="btn-ghost p-2" onClick={() => router.push(`/event/${eventId}`)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">สรุปยอด</h1>
                        <p className="text-xs text-txt-tertiary">{eventName}</p>
                    </div>
                </div>

                {/* overview stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-sm:grid-cols-1">
                    <div className="stat-card">
                        <div className="text-[1.75rem] font-bold tracking-tight gradient-text">
                            {totalExpenses.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-txt-tertiary font-medium mt-1 uppercase tracking-wider">ยอดรวม (บาท)</div>
                    </div>
                    <div className="stat-card">
                        <div className="text-[1.75rem] font-bold tracking-tight text-success">{expenses.length}</div>
                        <div className="text-xs text-txt-tertiary font-medium mt-1 uppercase tracking-wider">รายการ</div>
                    </div>
                    <div className="stat-card">
                        <div className="text-[1.75rem] font-bold tracking-tight text-warning">{settlements.length}</div>
                        <div className="text-xs text-txt-tertiary font-medium mt-1 uppercase tracking-wider">รายการโอน</div>
                    </div>
                </div>

                {/* per-member breakdown */}
                <div className="glass-card p-6 mb-7">
                    <h3 className="text-[0.95rem] font-bold mb-4 flex items-center gap-2">
                        <Wallet size={16} className="text-accent" />
                        สรุปแต่ละคน
                    </h3>
                    <div className="flex flex-col gap-2">
                        {members.map((member) => {
                            const summary = calculateMemberSummary(member.id, expenses, splits);
                            const isPositive = summary.net >= 0;
                            return (
                                <div key={member.id} className="flex items-center justify-between px-3.5 py-3 bg-surface border border-border rounded-xl">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPositive ? 'bg-success-soft' : 'bg-danger-soft'}`}>
                                            {isPositive ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-danger" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">{member.name}</div>
                                            <div className="text-[0.7rem] text-txt-tertiary">
                                                จ่ายไป {summary.totalPaid.toLocaleString()} / รับผิดชอบ {summary.totalOwed.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-bold tabular-nums ${summary.net > 0 ? 'text-success' : summary.net < 0 ? 'text-danger' : 'text-txt-tertiary'}`}>
                                        {summary.net > 0 ? '+' : ''}{summary.net.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* settlement transactions */}
                <div className="glass-card p-6 mb-7">
                    <h3 className="text-[0.95rem] font-bold mb-4 flex items-center gap-2">
                        <ArrowRight size={16} className="text-accent" />
                        รายการโอน
                    </h3>

                    {settlements.length === 0 ? (
                        <div className="text-center py-10 text-txt-tertiary">
                            <Check size={32} className="text-success mx-auto mb-3" />
                            <p className="text-sm font-semibold">ไม่มีรายการต้องโอน — ทุกคนจ่ายเท่ากันแล้ว</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {settlements.map((s, i) => (
                                <SettlementRow
                                    key={i}
                                    settlement={s}
                                    expanded={expandedQR === i}
                                    onToggle={() => setExpandedQR(expandedQR === i ? null : i)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <button className="btn-secondary inline-flex items-center gap-2" onClick={() => router.push(`/event/${eventId}`)}>
                        <ArrowLeft size={16} />
                        กลับหน้าอีเวนต์
                    </button>
                </div>
            </div>
        </div>
    );
}

/** แถวแสดง "ใคร → ใคร เท่าไหร่" พร้อมกางดู QR ได้ */
function SettlementRow({ settlement, expanded, onToggle }: {
    settlement: Settlement;
    expanded: boolean;
    onToggle: () => void;
}) {
    const hasQR = !!settlement.to.promptpay_id;

    return (
        <div>
            <div
                className={`settle-arrow ${hasQR ? 'cursor-pointer' : ''}`}
                onClick={() => hasQR && onToggle()}
            >
                {/* ฝั่งคนจ่าย */}
                <div className="flex items-center gap-2 flex-1">
                    <div className="w-9 h-9 rounded-full bg-danger-soft flex items-center justify-center font-bold text-xs text-danger">
                        {settlement.from.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm">{settlement.from.name}</span>
                </div>

                {/* ยอดตรงกลาง */}
                <div className="text-center">
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-6 rounded-full bg-[image:var(--accent-gradient)]" />
                        <span className="gradient-text font-bold text-lg tabular-nums">
                            {settlement.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="h-0.5 w-6 rounded-full bg-[image:var(--accent-gradient)]" />
                    </div>
                    <div className="text-[0.65rem] text-txt-tertiary mt-0.5">บาท</div>
                </div>

                {/* ฝั่งคนรับ */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-semibold text-sm">{settlement.to.name}</span>
                    <div className="w-9 h-9 rounded-full bg-success-soft flex items-center justify-center font-bold text-xs text-success">
                        {settlement.to.name.charAt(0)}
                    </div>
                </div>

                {hasQR && (
                    <div className="ml-2">
                        {expanded ? <ChevronUp size={16} className="text-txt-tertiary" /> : <ChevronDown size={16} className="text-txt-tertiary" />}
                    </div>
                )}
            </div>

            {/* QR PromptPay — กางออกเมื่อกด */}
            {expanded && settlement.to.promptpay_id && (
                <div className="bg-surface border border-border border-t-0 rounded-b-3xl p-6 text-center -mt-px animate-[slideUp_0.2s_ease]">
                    <p className="text-xs text-txt-secondary mb-4">สแกนเพื่อโอนให้ {settlement.to.name}</p>
                    <QRCode data={generatePromptPayPayload(settlement.to.promptpay_id, settlement.amount)} size={180} />
                    <p className="text-[0.7rem] text-txt-tertiary mt-3">PromptPay: {settlement.to.promptpay_id}</p>
                </div>
            )}
        </div>
    );
}
