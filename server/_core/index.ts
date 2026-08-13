import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // Same-origin proxy for the external OmniPOS portal. This is required by the web preview
  // because the portal does not expose browser CORS headers for credentialed requests.
  app.use("/api/portal/trpc", async (req, res, next) => {
    try {
      const target = `https://omnipos-hjcb6uyk.manus.space/api/trpc${req.originalUrl.replace(/^\/api\/portal\/trpc/, "")}`;
      const response = await fetch(target, {
        method: req.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
        },
        body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body ?? {}),
      });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        res.setHeader("set-cookie", setCookie.split(/,(?=[^;]+?=)/).map((cookie) => cookie.replace(/;?\s*Domain=[^;]+/gi, "").replace(/;?\s*Secure/gi, "")));
      }
      res.status(response.status);
      res.setHeader("content-type", response.headers.get("content-type") ?? "application/json");
      res.send(await response.text());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
