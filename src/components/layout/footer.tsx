import { getDict } from "@/lib/locale";

export async function Footer({ siteName }: { siteName: string }) {
  const { t } = await getDict();
  return (
    <footer className="border-t border-line px-6 py-8 text-center text-sm text-muted">
      <p>
        © {new Date().getFullYear()} {siteName}. {t.rights}
      </p>
      <p className="mt-1">{t.footer}</p>
    </footer>
  );
}
