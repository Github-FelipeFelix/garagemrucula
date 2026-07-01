"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Incrementa o contador de views (RPC atomica). Guard evita duplicar no StrictMode.
export function ViewTracker({ carId }: { carId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const supabase = createClient();
    supabase.rpc("bump_car_view", { p_car_id: carId }).then(({ error }) => {
      if (error) console.debug("[view]", error.message);
    });
  }, [carId]);
  return null;
}
