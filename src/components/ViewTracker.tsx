"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Incrementa o contador de views (RPC atomica). Guard evita duplicar no StrictMode.
// Serve carro E peça: passe carId (bump_car_view) OU partId (bump_part_view).
export function ViewTracker({ carId, partId }: { carId?: string; partId?: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const supabase = createClient();
    const call = partId
      ? supabase.rpc("bump_part_view", { p_part_id: partId })
      : carId
        ? supabase.rpc("bump_car_view", { p_car_id: carId })
        : null;
    call?.then(({ error }) => {
      if (error) console.debug("[view]", error.message);
    });
  }, [carId, partId]);
  return null;
}
