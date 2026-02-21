import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full mt-auto py-8 px-6 border-t border-border/50 bg-surface/30 backdrop-blur-md">
            <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Logo & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100">
                        <Image src="/icon.png" width={24} height={24} alt="HarnTung Logo" className="rounded-md" />
                        <span className="bg-clip-text text-transparent bg-[image:var(--accent-gradient)]">HarnTung</span>
                    </Link>
                    <p className="text-xs text-txt-tertiary">
                        © {currentYear} HarnTung. All rights reserved.
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 text-xs text-txt-secondary mt-4 md:mt-0">
                    <div className="flex items-center gap-1">
                        Created by
                        <a
                            href="https://github.com/markelopuangpoo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-accent hover:text-accent-light transition-colors"
                        >
                            @Pondet
                        </a>
                    </div>
                    <Link href="/privacy" className="hover:text-txt-primary transition-colors underline decoration-border/50 underline-offset-2">
                        นโยบายความเป็นส่วนตัว
                    </Link>
                </div>

            </div>
        </footer>
    );
}
