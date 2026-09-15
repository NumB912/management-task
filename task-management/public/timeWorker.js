let endTime= null;
let timerId = null;

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function tick() {
  if (endTime === null) return;

  const remaining = Math.max(endTime - Date.now(), 0);
  self.postMessage({ type: "TICK", remaining });

  if (remaining <= 0) {
    clearTimer();
    self.postMessage({ type: "DONE" });
  }
}

self.onmessage = (e) => {
  const { type, payload } = e.data;
  switch (type) {
    case "START": {
      endTime = payload.endTime;
      clearTimer();
      tick();
      timerId = setInterval(tick, 1000);
      break;
    }
    case "STOP": {
      clearTimer();
      endTime = null;
      break;
    }
  }
};