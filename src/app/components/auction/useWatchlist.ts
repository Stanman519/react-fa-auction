import { useCallback, useEffect, useState } from "react";

const KEY = "fanpools_watchlist_v1";

const read = (): Set<number> => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
};

const write = (s: Set<number>) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(s)));
  } catch {
    /* quota or disabled */
  }
};

export const useWatchlist = () => {
  const [ids, setIds] = useState<Set<number>>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setIds(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((mflId: number) => {
    setIds((prev) => {
      const next = new Set(Array.from(prev));
      if (next.has(mflId)) next.delete(mflId);
      else next.add(mflId);
      write(next);
      return next;
    });
  }, []);

  const has = useCallback((mflId: number) => ids.has(mflId), [ids]);

  return { ids, has, toggle };
};
