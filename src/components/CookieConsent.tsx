'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // เช็คว่าเคยตกลงไปแล้วหรือยัง
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie_consent', 'true');
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="max-w-[960px] mx-auto bg-surface/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="text-sm text-txt-secondary flex-1">
                    <p className="m-0 mb-1 font-bold text-txt-primary text-base">การใช้งานคุกกี้ 🍪</p>
                    <p className="m-0">
                        เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งานของคุณให้ดียิ่งขึ้น การใช้งานแอปพลิเคชันนี้ต่อถือว่าคุณยินยอมตาม{' '}
                        <Link href="/privacy" className="text-accent hover:text-accent-light underline underline-offset-2 transition-colors">
                            นโยบายความเป็นส่วนตัว
                        </Link>{' '}
                        ของเรา
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                        onClick={acceptCookies}
                        className="btn-primary w-full md:w-auto px-8 py-2.5 font-bold"
                    >
                        ยอมรับ
                    </button>
                    <Link
                        href="/privacy"
                        className="btn-ghost w-full md:w-auto text-center px-4 py-2.5 text-sm"
                    >
                        อ่านเพิ่มเติม
                    </Link>
                </div>

            </div>
        </div>
    );
}
