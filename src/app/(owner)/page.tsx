import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { requireOwner } from "@/lib/auth/server";

export default async function HomePage() {
  await requireOwner();
  const t = await getTranslations("Home");

  return (
    <section className="flex flex-1 flex-col justify-center gap-6">
      <h1 className="text-5xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-lg text-muted-foreground">{t("tagline")}</p>
      <div>
        <Button disabled>{t("cta")}</Button>
      </div>
    </section>
  );
}
