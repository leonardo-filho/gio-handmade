"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  foto: string;
  categoria?: string;
};

export type CartLine = CartItem & { qty: number };

type CartContextValue = {
  lines: CartLine[];
  add: (item: CartItem, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "gio-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata do localStorage no client (evita mismatch de SSR)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      /* ignora storage indisponível */
    }
    setHydrated(true);
  }, []);

  // Persiste sempre que o carrinho muda (após hidratar)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignora */
    }
  }, [lines, hydrated]);

  const add = useCallback((item: CartItem, qty: number = 1) => {
    setLines((prev) => {
      const existente = prev.find((l) => l.id === item.id);
      if (existente) {
        return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { ...item, qty }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => lines.reduce((acc, l) => acc + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + l.preco * l.qty, 0),
    [lines]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      add,
      remove,
      setQty,
      clear,
      count,
      subtotal,
      isOpen,
      open,
      close,
      hydrated,
    }),
    [lines, add, remove, setQty, clear, count, subtotal, isOpen, open, close, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
