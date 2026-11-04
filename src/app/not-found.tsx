import Link from "next/link";
import { getDict } from "@/lib/locale";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <div className="planet-static mx-auto mb-8 h-28 w-28" aria-hidden />
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-4xl font-extrabold sm:text-6xl"><span className="text-gradient">{t.notFound}</span></h1>
        <p className="mx-auto mt-4 max-w-md text-muted">{t.notFoundText}</p>
        <Link href="/" className="btn btn-primary mt-8">{t.goHome}</Link>
      </div>
    </main>
  );
}
