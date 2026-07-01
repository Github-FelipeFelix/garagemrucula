import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl font-extrabold text-rucula-bright">404</p>
      <h1 className="font-display text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted">Esse endereço não existe ou o carro já saiu da garagem.</p>
      <Link href="/" className="btn btn-primary mt-2">
        Voltar ao início
      </Link>
    </div>
  );
}
