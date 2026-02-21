'use client';

import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
    data: string;
    size?: number;
}

export default function QRCode({ data, size = 200 }: QRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        QRCodeLib.toCanvas(canvasRef.current, data, {
            width: size,
            margin: 2,
            color: { dark: '#1a1a2e', light: '#ffffff' },
            errorCorrectionLevel: 'M',
        }).catch(() => setError(true));
    }, [data, size]);

    if (error) {
        return (
            <div className="flex items-center justify-center rounded-xl bg-surface-hover text-txt-tertiary text-xs"
                style={{ width: size, height: size }}>
                QR Error
            </div>
        );
    }

    return <canvas ref={canvasRef} className="rounded-xl max-w-full h-auto" />;
}
