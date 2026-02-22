import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-stone-100 text-gray-600 py-12 border-t border-stone-200">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Brand */}
                <div className="text-center md:text-left">
                    <h3 className="font-serif text-lg font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Gio Handmade
                    </h3>
                    <p className="text-xs text-gray-500">
                        Feito à mão com amor
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-6">
                    <Link
                        href="https://instagram.com/gio.handmade__"
                        target="_blank"
                        className="text-sm uppercase tracking-widest hover:text-gray-900 transition-colors"
                    >
                        Instagram
                    </Link>
                    <Link
                        href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento."
                        target="_blank"
                        className="text-sm uppercase tracking-widest hover:text-gray-900 transition-colors"
                    >
                        WhatsApp
                    </Link>
                </div>

                {/* Copyright */}
                <div className="text-xs text-gray-400">
                    &copy; {currentYear} Gio Handmade. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}
