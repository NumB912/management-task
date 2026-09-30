import { authMiddleware } from "@infrastructure/api/express/middleware/auth.middleware.js";
import type { SSERealtimeGateway } from "@infrastructure/gateway/realtime.js";
import { Router } from "express";

export function createSSERoute(gateway: SSERealtimeGateway) {
  const router = Router();

  router.get("/notifications/stream", authMiddleware, (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Không xác thực được người dùng",
      });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();
    res.write("retry: 3000\n\n");

    gateway.register(user.id, res);
    res.write(`event: connected\ndata: {}\n\n`);

    let cleaned = false;
    const heartbeat = setInterval(() => {
      if (res.writableEnded || res.destroyed) return cleanup();
      res.write(`: heartbeat\n\n`);
    }, 8000);

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      clearInterval(heartbeat);
      gateway.unregister(user.id, res);
    };

    res.on("close", cleanup);
    res.on("error", cleanup);
  });

  return router;
}