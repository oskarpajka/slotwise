import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/auth/server";

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  const t = await getTranslations("Login");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col px-4 py-6">
      <header className="flex items-center justify-between gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </header>
      <section className="flex flex-1 flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t("appName")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {t("title")}
          </h1>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
