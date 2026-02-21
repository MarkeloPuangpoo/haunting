import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { LayoutDashboard, Calendar as CalendarIcon, ArrowLeft, Plus, Users, Receipt, Split } from 'lucide-react';
import type { Event } from '@/lib/types';
import EventCard from '@/app/dashboard/EventCard';
import Footer from '@/components/Footer';

export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) {
        redirect('/');
    }

    // ดึงข้อมูลอีเวนต์ทั้งหมดที่ผู้ใช้เป็นเจ้าของ
    // ใช้ anon key ได้เลย เพราะเราเปิดให้ view public แต่จะ filter ตาม owner_id
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: events, error } = await supabase
        .from('events')
        .select('id, name, created_at, owner_id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="mesh-bg min-h-dvh flex items-center justify-center">
                <div className="text-danger font-medium p-6 bg-surface rounded-2xl">
                    เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}
                </div>
            </div>
        );
    }

    const typedEvents = events as Event[];

    return (
        <div className="mesh-bg min-h-dvh flex flex-col">
            <header className="w-full max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="btn-ghost p-2 -ml-2 text-txt-secondary hover:text-txt-primary">
                    <ArrowLeft size={20} />
                </Link>
                <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                    <LayoutDashboard size={18} className="text-accent" />
                    วงของฉัน
                </div>
                <div className="w-10"></div> {/* spacer */}
            </header>

            <main className="max-w-[960px] mx-auto px-6 pt-6 pb-12 flex-1 w-full flex flex-col">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                            สวัสดีคุณ {user.firstName || 'ผู้ใช้งาน'} 👋
                        </h1>
                        <p className="text-txt-secondary">
                            คุณมีวงทั้งหมด {typedEvents?.length || 0} วงในระบบ
                        </p>
                    </div>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 h-fit">
                        <Plus size={16} />
                        สร้างวงใหม่
                    </Link>
                </div>

                {/* Empty State */}
                {(!typedEvents || typedEvents.length === 0) && (
                    <div className="glass-card flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                        <div className="w-20 h-20 rounded-full bg-accent-soft flex items-center justify-center mb-6">
                            <Split size={32} className="text-accent" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">ยังไม่มีวงที่สร้างเลย</h3>
                        <p className="text-txt-tertiary mb-8 max-w-sm">
                            เริ่มสร้างวงใหม่เพื่อแชร์ค่าใช้จ่ายกับเพื่อน ๆ ได้ทันที
                        </p>
                        <Link href="/" className="btn-primary inline-flex items-center gap-2 py-3 px-6">
                            <Plus size={18} />
                            คลิกเพื่อสร้างวงแรก
                        </Link>
                    </div>
                )}

                {/* Events Grid */}
                {typedEvents && typedEvents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {typedEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
