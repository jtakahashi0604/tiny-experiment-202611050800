import { serve } from "bun";

import index from "@/client/index.html";

const server = serve({
  routes: {
    "/": Response.redirect("/bounceGame"),
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
