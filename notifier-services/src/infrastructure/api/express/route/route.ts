import { buildContainer } from '@infrastructure/container/container.js';
import express from 'express';

const router = express.Router();

console.log("[route.js] Bắt đầu buildContainer...");
const { notifierUsecase,sectionRemove,taskCreate,taskRemove,taskUpdate, sseRoute,sectionCreate,sectionUpdate,sectionChangePosition } = await buildContainer();
console.log("[route.js] buildContainer xong, gateway đã sẵn sàng");
console.log("[route.js] Bắt đầu notifierUsecase.execute() (subscribe RabbitMQ)...");
await notifierUsecase.execute();
await taskCreate.execute();
await taskRemove.execute()
await taskUpdate.execute()
await sectionCreate.execute()
await sectionRemove.execute()
await sectionUpdate.execute()
await sectionChangePosition.execute()
console.log("[route.js] notifierUsecase đã subscribe xong, sẵn sàng nhận event");
router.use("/api", sseRoute);
console.log("[route.js] Đã mount sseRoute tại /api");

export default router;