"use client";

import { useEffect, useState } from "react";

const WHATSAPP_HREF =
  "https://wa.me/559192982017?text=Ol%C3%A1%2C%20vi%20o%20cat%C3%A1logo%20e%20quero%20encomendar%20uma%20pe%C3%A7a.";

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      const doc = document.documentElement.scrollHeight;
      setVisible(y > h * 0.6);
      setNearFooter(y + h > doc - 220);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Encomendar pelo WhatsApp"
      className={`fixed z-40 right-4 md:right-6 transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-6"
      } ${nearFooter ? "bottom-24 md:bottom-28" : "bottom-5 md:bottom-7"}`}
    >
      <span className="group flex items-center gap-2.5 bg-[#1B4965] text-[#EDE7D9] px-4 py-3 md:px-5 md:py-3.5 rounded-full shadow-lg shadow-[#130209]/25 hover:bg-[#130209] transition-colors min-h-[48px]">
        <svg
          viewBox="0 0 32 32"
          width="22"
          height="22"
          fill="currentColor"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.43 3.41 4.494 4.353.616.287 2.005.888 2.722.888.6 0 1.747-.43 2.005-1.118.13-.345.273-.674.273-1.045 0-.43-1.16-.945-1.518-1.06zm-2.92 7.444a9.65 9.65 0 0 1-3.92-.83l-4.385 1.4 1.43-4.243a9.66 9.66 0 0 1-.99-4.296c0-5.45 4.42-9.87 9.87-9.87a9.87 9.87 0 0 1 9.87 9.87c0 5.45-4.42 9.97-9.87 9.97zM16.19 4.78A11.42 11.42 0 0 0 4.77 16.198c0 1.85.47 3.65 1.36 5.23L4.34 27.24l5.92-1.78a11.42 11.42 0 0 0 5.93 1.64h.01a11.45 11.45 0 0 0 11.42-11.45 11.4 11.4 0 0 0-3.33-8.06 11.41 11.41 0 0 0-8.1-3.36z" />
        </svg>
        <span className="text-[10px] md:text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-display)] font-bold whitespace-nowrap">
          Encomendar
        </span>
      </span>
    </a>
  );
}
