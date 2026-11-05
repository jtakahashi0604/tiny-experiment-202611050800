import type { ComponentType } from "react";

import { BounceGameIndex } from "@/client/components/app/bounceGame";

import "@/client/index.css";

// pathname -> page
const PAGES: Record<string, ComponentType> = {
  "/bounceGame": BounceGameIndex,
};

export const App = () => {
  const Page = PAGES[window.location.pathname];
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-6">
      {Page ? <Page /> : <p className="text-muted-foreground">page not found</p>}
    </main>
  );
};
