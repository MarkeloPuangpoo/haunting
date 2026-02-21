'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Event, Member, Expense, ExpenseSplit } from '@/lib/types';
import MemberList from '@/components/MemberList';
import AddExpenseModal from '@/components/AddExpenseModal';
import { ArrowLeft, Plus, Receipt, Users, TrendingUp, Share2, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabaseClient';

const SPLIT_LABELS: Record<string, string> = {
    equal: 'หารเท่า',
    select: 'เลือกคน',
    custom: 'ระบุเอง',
};

export default function EventPage() {
    const params = useParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const eventId = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [splits, setSplits] = useState<ExpenseSplit[]>([]);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const fetchData = useCallback(async () => {
        if (!eventId) return;

        try {
            const [eventRes, membersRes, expensesRes, splitsRes] = await Promise.all([
                supabase.from('events').select('*').eq('id', eventId).single(),
                supabase.from('members').select('*').eq('event_id', eventId),
                supabase.from('expenses').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
                supabase.from('expense_splits').select('*, expenses!inner(event_id)').eq('expenses.event_id', eventId),
            ]);

            if (eventRes.data) setEvent(eventRes.data);
            if (membersRes.data) setMembers(membersRes.data);
            if (expensesRes.data) setExpenses(expensesRes.data);
            if (splitsRes.data) setSplits(splitsRes.data);
        } catch (error) {
            console.error('Error fetching event data:', error);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddMember = async (name: string, promptpayId?: string) => {
        const token = await getToken({ template: 'supabase' });
        if (!token) { toast.error('กรุณาเข้าสู่ระบบก่อน'); return; }
        const supabaseAuth = createClerkSupabaseClient(token);

        const { error } = await supabaseAuth.from('members').insert({
            event_id: eventId,
            name,
            promptpay_id: promptpayId || null,
        });
        if (!error) {
            toast.success(`เพิ่ม ${name} สำเร็จ`);
            fetchData();
        } else {
            toast.error('เพิ่มสมาชิกล้มเหลว');
        }
    };

    const handleRemoveMember = async (id: string) => {
        const token = await getToken({ template: 'supabase' });
        if (!token) { toast.error('กรุณาเข้าสู่ระบบก่อน'); return; }
        const supabaseAuth = createClerkSupabaseClient(token);

        // ห้ามลบถ้ามีรายจ่ายหรือ split ผูกอยู่
        const isUsed = expenses.some((e) => e.paid_by === id) || splits.some((s) => s.member_id === id);
        if (isUsed) { alert('ไม่สามารถลบสมาชิกที่เกี่ยวข้องกับค่าใช้จ่ายได้'); return; }
        const { error } = await supabaseAuth.from('members').delete().eq('id', id);
        if (!error) {
            toast.success('ลบสมาชิกแล้ว');
            fetchData();
        } else {
            toast.error('เกิดข้อผิดพลาดในการลบสมาชิก');
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!confirm('ลบรายการนี้?')) return;
        // ต้องลบ splits ก่อนเพราะ FK constraint

        const token = await getToken({ template: 'supabase' });
        if (!token) { toast.error('กรุณาเข้าสู่ระบบก่อน'); return; }
        const supabaseAuth = createClerkSupabaseClient(token);

        const loadingToastId = toast.loading('กำลังลบรายการ...');
        try {
            await supabaseAuth.from('expense_splits').delete().eq('expense_id', expenseId);
            await supabaseAuth.from('expenses').delete().eq('id', expenseId);
            toast.success('ลบรายการค่าใช้จ่ายแล้ว', { id: loadingToastId });
            fetchData();
        } catch (error) {
            toast.error('ลบรายการไม่สำเร็จ', { id: loadingToastId });
            console.error('Error deleting expense:', error);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('คัดลอกลิงก์เรียบร้อยแล้ว');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            prompt('คัดลอกลิงก์นี้:', url);
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || 'ไม่ทราบ';

    // TODO: skeleton loader แทน spinner ธรรมดาจะดีกว่า
    if (loading) {
        return (
            <div className="mesh-bg min-h-dvh flex items-center justify-center">
                <div className="float-element text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[image:var(--accent-gradient)]" />
                    <p className="text-txt-tertiary">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="mesh-bg min-h-dvh flex items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2">ไม่พบวงนี้</h2>
                    <button className="btn-primary" onClick={() => router.push('/')}>กลับหน้าหลัก</button>
                </div>
            </div>
        );
    }

    return (
        <div className="mesh-bg min-h-dvh">
            <div className="max-w-[960px] mx-auto px-4 py-6">
                {/* header */}
                <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-3">
                        <button className="btn-ghost p-2" onClick={() => router.push('/')}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">{event.name}</h1>
                            <p className="text-xs text-txt-tertiary">
                                {new Date(event.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button className="btn-secondary flex items-center gap-2 px-4 py-2.5" onClick={handleShare}>
                        <Share2 size={16} />
                        {copied ? 'คัดลอกแล้ว' : 'แชร์'}
                    </button>
                </div>

                {/* stat cards */}
                <div className="grid grid-cols-3 gap-4 mb-7 max-sm:grid-cols-1">
                    <StatCard icon={<Users size={18} className="text-accent" />} iconBg="bg-accent-soft" value={members.length} label="สมาชิก" valueClass="gradient-text" />
                    <StatCard icon={<Receipt size={18} className="text-success" />} iconBg="bg-success-soft" value={expenses.length} label="รายการ" valueClass="text-success" />
                    <StatCard
                        icon={<TrendingUp size={18} className="text-warning" />}
                        iconBg="bg-warning-soft"
                        value={totalExpenses.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        label="ยอดรวม (บาท)"
                        valueClass="text-warning"
                    />
                </div>

                {/* two-column: members + expenses */}
                <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <div className="glass-card p-6">
                        <h3 className="text-[0.95rem] font-bold mb-4 flex items-center gap-2">
                            <Users size={16} className="text-accent" />
                            สมาชิก
                        </h3>
                        <MemberList members={members} onAddMember={handleAddMember} onRemoveMember={handleRemoveMember} />
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[0.95rem] font-bold flex items-center gap-2">
                                <Receipt size={16} className="text-success" />
                                ค่าใช้จ่าย
                            </h3>
                            {members.length >= 2 && (
                                <>
                                    <SignedIn>
                                        <button className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5" onClick={() => setShowAddExpense(true)}>
                                            <Plus size={14} />
                                            เพิ่ม
                                        </button>
                                    </SignedIn>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5">
                                                เข้าสู่ระบบเพื่อเพิ่ม
                                            </button>
                                        </SignInButton>
                                    </SignedOut>
                                </>
                            )}
                        </div>

                        {expenses.length === 0 ? (
                            <div className="text-center py-10 text-txt-tertiary">
                                <Receipt size={32} className="text-border mx-auto mb-3" />
                                <p className="text-sm">ยังไม่มีรายการ</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {expenses.map((expense) => (
                                    <div key={expense.id} className="bento-item flex items-center justify-between px-4 py-3.5 !rounded-xl">
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm mb-1">{expense.description}</div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="chip text-[0.7rem]">จ่ายโดย {getMemberName(expense.paid_by)}</span>
                                                <span className="chip chip-active text-[0.7rem]">{SPLIT_LABELS[expense.split_method]}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold tabular-nums">
                                                {expense.amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                            </span>
                                            <SignedIn>
                                                <button className="btn-ghost p-1 text-danger" onClick={() => handleDeleteExpense(expense.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </SignedIn>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {expenses.length > 0 && (
                    <div className="mt-7 text-center">
                        <button
                            className="btn-primary inline-flex items-center gap-2.5 px-10 py-4 text-lg"
                            onClick={() => router.push(`/event/${eventId}/settle`)}
                        >
                            สรุปยอดเคลียร์บิล
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {showAddExpense && (
                <AddExpenseModal eventId={eventId} members={members} onClose={() => setShowAddExpense(false)} onAdded={fetchData} />
            )}
        </div>
    );
}

/** stat card ที่ใช้ซ้ำใน bento grid */
function StatCard({ icon, iconBg, value, label, valueClass }: {
    icon: React.ReactNode;
    iconBg: string;
    value: string | number;
    label: string;
    valueClass: string;
}) {
    return (
        <div className="stat-card card-3d">
            <div className="card-3d-inner">
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-2`}>
                    {icon}
                </div>
                <div className={`text-[1.75rem] font-bold tracking-tight ${valueClass}`}>{value}</div>
                <div className="text-xs text-txt-tertiary font-medium mt-1 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}
