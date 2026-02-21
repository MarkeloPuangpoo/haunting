'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, X, Sparkles, Split, QrCode, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const [eventName, setEventName] = useState('');
  const [memberNames, setMemberNames] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addField = () => setMemberNames([...memberNames, '']);

  const removeField = (i: number) => {
    if (memberNames.length <= 2) return;
    setMemberNames(memberNames.filter((_, idx) => idx !== i));
  };

  const updateField = (i: number, value: string) => {
    const updated = [...memberNames];
    updated[i] = value;
    setMemberNames(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!eventName.trim()) { setError('ตั้งชื่อวงก่อนนะ'); return; }
    const validNames = memberNames.filter((n) => n.trim());
    if (validNames.length < 2) { setError('ใส่ชื่อสมาชิกอย่างน้อย 2 คน'); return; }

    setLoading(true);
    setError('');

    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อนสร้างวง');

      const supabase = createClerkSupabaseClient(token);

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({ name: eventName.trim(), owner_id: userId })
        .select()
        .single();
      if (eventError) throw eventError;

      const { error: memberError } = await supabase
        .from('members')
        .insert(validNames.map((name) => ({ event_id: event.id, name: name.trim() })));
      if (memberError) throw memberError;

      toast.success('สร้างวงสำเร็จแล้ว 🎉');
      router.push(`/event/${event.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg min-h-dvh flex flex-col">
      {/* Header with Auth */}
      <header className="w-full max-w-[960px] mx-auto px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-lg tracking-tight flex items-center gap-2">
          <Image src="/icon.png" width={28} height={28} alt="HarnTung Logo" className="rounded-md shadow-sm" />
          HarnTung
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-secondary text-sm px-4 py-2">เข้าสู่ระบบ</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium text-txt-secondary hover:text-txt-primary transition-colors">
              วงของฉัน
            </Link>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          </SignedIn>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-6 pt-10 pb-10 flex-1">
        <div className="text-center mb-12">
          <div className="float-element w-[80px] h-[80px] mx-auto mb-6 rounded-[1.75rem] flex items-center justify-center shadow-[var(--shadow-glow)] overflow-hidden bg-white">
            <Image src="/icon.png" width={80} height={80} alt="HarnTung Logo" className="object-cover" />
          </div>

          <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight leading-tight mb-3">
            <span className="gradient-text">HarnTung</span>
          </h1>
          <p className="text-[clamp(1rem,2.5vw,1.2rem)] text-txt-secondary max-w-md mx-auto">
            หารค่าใช้จ่ายกับเพื่อน ไม่ต้องปวดหัวอีกต่อไป
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12 max-sm:grid-cols-1">
          <FeatureCard
            icon={<Calculator size={20} className="text-accent" />}
            iconBg="bg-accent-soft"
            title="หารได้ 3 แบบ"
            desc="หารเท่า เลือกคน หรือระบุยอดเอง ยืดหยุ่นทุกสถานการณ์"
          />
          <FeatureCard
            icon={<Sparkles size={20} className="text-success" />}
            iconBg="bg-success-soft"
            title="Debt Simplification"
            desc="ลดจำนวนการโอนให้น้อยที่สุด รวบยอดหนี้อัตโนมัติ"
          />
          <FeatureCard
            icon={<QrCode size={20} className="text-warning" />}
            iconBg="bg-warning-soft"
            title="QR PromptPay"
            desc="สร้าง QR Code พร้อมยอดเงิน สแกนโอนได้เลย"
          />
        </div>

        <form onSubmit={handleSubmit} className="glass-card max-w-lg mx-auto p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">สร้างวงใหม่</h2>

          <div className="mb-5">
            <label className="field-label">ชื่อวง</label>
            <input
              className="input"
              placeholder='เช่น "ปาร์ตี้วันเกิด" หรือ "ทริปทะเล"'
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="field-label">สมาชิก</label>
            <div className="flex flex-col gap-2">
              {memberNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input"
                    placeholder={`สมาชิกคนที่ ${i + 1}`}
                    value={name}
                    onChange={(e) => updateField(i, e.target.value)}
                    // กด Enter ที่ช่องสุดท้าย → เพิ่มช่องใหม่แทน submit
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && i === memberNames.length - 1) {
                        e.preventDefault();
                        addField();
                      }
                    }}
                  />
                  {memberNames.length > 2 && (
                    <button type="button" className="btn-ghost p-1.5 shrink-0" onClick={() => removeField(i)}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn-ghost mt-2 flex items-center gap-1.5 text-sm" onClick={addField}>
              <Plus size={14} />
              เพิ่มสมาชิก
            </button>
          </div>

          {error && (
            <div className="px-3.5 py-2.5 mb-4 bg-danger-soft text-danger rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <SignedIn>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base" disabled={loading}>
              {loading ? 'กำลังสร้าง...' : 'สร้างวง'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
                เข้าสู่ระบบเพื่อสร้างวง
                <ArrowRight size={18} />
              </button>
            </SignInButton>
          </SignedOut>
        </form>
      </div>

      <Footer />
    </div>
  );
}

/** bentoบน */
function FeatureCard({ icon, iconBg, title, desc }: { icon: React.ReactNode; iconBg: string; title: string; desc: string }) {
  return (
    <div className="bento-item card-3d">
      <div className="card-3d-inner">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3.5`}>
          {icon}
        </div>
        <h3 className="text-[0.95rem] font-bold mb-1.5">{title}</h3>
        <p className="text-xs text-txt-tertiary leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
