import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import DeleteEventButton from '@/app/admin/DeleteEventButton';
import { LayoutDashboard, CalendarDays, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
    // 1. ตรวจสอบสิทธิ์ว่าเป็น Admin หรือไม่ (ดึงจาก Public Metadata)
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
        redirect('/'); // ถ้าไม่ใช่ admin ให้เด้งกลับหน้าแรก
    }

    // 2. ดึงข้อมูล Event ทั้งหมด (ใช้ anon key ปกติได้เลยเพราะเราเปิด public ให้ view ไว้)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: events, error } = await supabase
        .from('events')
        .select('id, name, created_at')
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

    return (
        <div className="mesh-bg min-h-dvh flex flex-col">
            <header className="w-full max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="btn-ghost p-2 -ml-2 text-txt-secondary hover:text-txt-primary">
                    <ArrowLeft size={20} />
                </Link>
                <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                    <LayoutDashboard size={18} className="text-warning" />
                    Admin Dashboard
                </div>
                <div className="w-10"></div> {/* spacer */}
            </header>

            <main className="max-w-[960px] mx-auto px-6 pt-6 pb-12 flex-1 w-full">
                <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning-soft flex items-center justify-center">
                            <CalendarDays size={20} className="text-warning" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">จัดการวงทั้งหมด</h2>
                            <p className="text-sm text-txt-tertiary">รายการอีเวนต์ทั้งหมดในระบบ ({events?.length || 0} วง)</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-surface border-b border-border text-[0.7rem] text-txt-tertiary uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">ชื่อวง (Event Name)</th>
                                    <th className="px-6 py-4">วันที่สร้าง</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {events?.map((event) => (
                                    <tr key={event.id} className="hover:bg-surface/40 transition-colors">
                                        <td className="px-6 py-4 font-medium text-[0.95rem]">{event.name}</td>
                                        <td className="px-6 py-4 text-sm text-txt-secondary">
                                            {new Date(event.created_at).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} น.
                                        </td>
                                        <td className="px-6 py-4 flex justify-end">
                                            <DeleteEventButton eventId={event.id} />
                                        </td>
                                    </tr>
                                ))}
                                {(!events || events.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-16 text-center text-txt-tertiary">
                                            <div className="flex flex-col items-center gap-3">
                                                <Calendar size={32} className="opacity-40" />
                                                <p className="text-sm font-medium">ไม่มีวงในระบบ</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
