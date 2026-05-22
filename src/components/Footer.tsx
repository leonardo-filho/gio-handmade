import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#1B4965] text-[#EDE7D9] py-14">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">

                {/* Brand */}
                <div className="text-center md:text-left flex flex-col items-center md:items-start gap-2">
                    <Image
                        src="/logo-cream.png"
                        alt="Gio Handmade"
                        width={1200}
                        height={856}
                        className="h-16 w-auto"
                    />
                    <p className="text-xs text-[#C8E1E4] italic font-[family-name:var(--font-serif)] tracking-wide">
                        Atemporal por natureza.
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-8">
                    <Link
                        href="https://instagram.com/gio.handmade__"
                        target="_blank"
                        className="text-xs uppercase tracking-[0.25em] text-[#EDE7D9]/80 hover:text-[#C8E1E4] transition-colors"
                    >
                        Instagram
                    </Link>
                    <Link
                        href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento."
                        target="_blank"
                        className="text-xs uppercase tracking-[0.25em] text-[#EDE7D9]/80 hover:text-[#C8E1E4] transition-colors"
                    >
                        WhatsApp
                    </Link>
                </div>

                {/* Copyright */}
                <div className="text-xs text-[#EDE7D9]/50 text-center md:text-right">
                    &copy; {currentYear} Gio Handmade<br />
                    <span className="text-[10px] tracking-widest">Belém · Pará</span>
                </div>
            </div>
        </footer>
    );
}
