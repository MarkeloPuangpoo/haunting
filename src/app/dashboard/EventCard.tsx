'use client';

import Link from 'next/link';
import { Calendar, Users, Receipt, ArrowRight } from 'lucide-react';
import type { Event } from '@/lib/types';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Helper component that fetches its own stats (members/expenses count)
export default function EventCard({ event }: { event: Event }) {
    const [memberCount, setMemberCount] = useState<number | null>(null);
    const [expenseCount, setExpenseCount] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchStats() {
            // ดึงจำนวนสมาชิก
            const { count: mCount } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id);

            // ดึงจำนวนรายการค่าใช้จ่าย
            const { count: eCount } = await supabase
                .from('expenses')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id);

            if (mounted) {
                setMemberCount(mCount);
                setExpenseCount(eCount);
            }
        }

        fetchStats();

        return () => {
            mounted = false;
        };
    }, [event.id]);

    return (
        <Link
            href={`/event/${event.id}`}
            className="bento-item group flex flex-col p-6 hover:shadow-[var(--shadow-glow)] transition-all duration-300"
        >
            <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold group-hover:text-accent transition-colors line-clamp-1 pr-4">
                        {event.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <ArrowRight size={14} className="text-accent" />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-txt-tertiary mb-6">
                    <Calendar size={12} />
                    <span>
                        {new Date(event.created_at).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Users size={16} className="text-txt-secondary" />
                    {memberCount !== null ? memberCount : '...'}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Receipt size={16} className="text-txt-secondary" />
                    {expenseCount !== null ? expenseCount : '...'}
                </div>
            </div>
        </Link>
    );
}
