import { PingIndex } from "@/client/components/app/ping";

import "@/client/index.css";

export const App = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
    <h1 className="text-2xl font-bold text-primary">Bun + React</h1>
    <PingIndex />
  </main>
);
