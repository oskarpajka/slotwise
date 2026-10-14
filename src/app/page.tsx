import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-6">
      <header className="flex items-center justify-between gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </header>
      <section className="flex flex-1 flex-col justify-center gap-6">
        <h1 className="text-5xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("tagline")}</p>
        <div>
          <Button disabled>{t("cta")}</Button>
        </div>
      </section>
    </main>
  );
}
