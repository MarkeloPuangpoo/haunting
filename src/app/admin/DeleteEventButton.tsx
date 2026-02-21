'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClerkSupabaseClient } from '@/lib/supabaseClient';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteEventButton({ eventId }: { eventId: string }) {
    const { getToken } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('แน่ใจหรือไม่ที่จะลบวงนี้? (ข้อมูลทุกอย่างจะหายไปทันทีโดยกู้คืนไม่ได้)')) return;

        setIsDeleting(true);
        const loadingToast = toast.loading('กำลังลบวง...');
        try {
            // 1. ดึง Token ของ Supabase จาก Clerk
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error('ไม่พบสิทธิ์ Admin');

            // 2. ใช้ wrapper ที่เราสร้างไว้ใน supabaseClient.ts
            const supabase = createClerkSupabaseClient(token);

            // 3. สั่งลบข้อมูล
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;

            toast.success('ลบวงเรียบร้อยแล้ว', { id: loadingToast });

            // ลบเสร็จให้รีเฟรชหน้าเพื่ออัปเดตรายการ
            router.refresh();

        } catch (err: any) {
            console.error('Error deleting event:', err);
            toast.error(err.message || 'เกิดข้อผิดพลาดในการลบวง', { id: loadingToast });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-ghost text-danger hover:bg-danger-soft p-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            title="ลบวง"
        >
            <Trash2 size={16} />
        </button>
    );
}
