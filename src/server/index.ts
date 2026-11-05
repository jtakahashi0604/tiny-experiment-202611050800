import { serve } from "bun";

import index from "@/client/index.html";
import { ping } from "@/server/services/ping";

const server = serve({
  routes: {
    "/*": index,

    "/api/ping": {
      POST: () => Response.json(ping()),
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
