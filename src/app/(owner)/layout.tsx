import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireOwner } from "@/lib/auth/server";

export default async function OwnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Layouts do not re-render on client navigation, so every page under
  // this layout also calls requireOwner().
  await requireOwner();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-6">
      <header className="flex items-center justify-between gap-2">
        <LocaleSwitcher />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      {children}
    </main>
  );
}
