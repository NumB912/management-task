import NotifiterUsecase from "@application/usecase/realtime.usecase.js";
import { SSERealtimeGateway } from "@infrastructure/gateway/realtime.js";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import { createSSERoute } from "@infrastructure/sse/sseRealTime.js";


export async function buildContainer() {
    const consumer = await Consumer.create();
    
  const realtimeGateway = new SSERealtimeGateway();
  const notifierUsecase = new NotifiterUsecase(consumer, realtimeGateway);
  return { realtimeGateway, notifierUsecase, sseRoute: createSSERoute(realtimeGateway) };
}