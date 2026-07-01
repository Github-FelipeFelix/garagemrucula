// Rate limiter in-memory, best-effort (regra 7: proteger rota pública de spam).
//
// Ressalva honesta: a serverless da Vercel pode rodar em várias instâncias, cada
// uma com seu próprio Map — então isto NÃO é um limite global rígido, mas segura
// bem a rajada de um mesmo cliente numa instância (que é o abuso comum). Para um
// limite distribuído de verdade, plugar Upstash/Redis aqui depois mantendo a
// mesma assinatura de rateLimit().

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export type RateResult = { ok: boolean; remaining: number; retryAfter: number };

// Conta uma tentativa para `key` dentro de uma janela deslizante simples.
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();

  // Limpeza preguiçosa: evita vazar memória em processos de vida longa.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((bucket.reset - now) / 1000)) };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

// IP do cliente atrás do proxy da Vercel (x-forwarded-for pode vir com vários).
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") || "unknown";
}
