
import { authMiddleware } from "@infrastructure/api/express/middleware/auth.middleware.js";
import type { SSERealtimeGateway } from "@infrastructure/gateway/realtime.js";
import { Router } from "express";

export function createSSERoute(gateway: SSERealtimeGateway) {
  const router = Router();
  router.get("/notifications/stream",authMiddleware, (req, res) => {
    const user = req.user;
    if(!user){
      return res.status(404).json({
        code:"NOT_FOUND",
        message:"Lỗi không tìm thấy người dùng"
      })
    }
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    gateway.register(user.id, res);
    res.write(`event: connected\ndata: {}\n\n`);
    const heartbeat = setInterval(() => res.write(`: heartbeat\n\n`), 8000);
    
    req.on("close", () => {
      clearInterval(heartbeat);
      gateway.unregister(user.id, res);
    });
  });

  return router;
}