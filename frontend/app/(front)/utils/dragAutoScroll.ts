// Pixels per frame, increasing as the pointer approaches a visible edge.
export function getEdgeScrollDelta(
  position: number,
  start: number,
  end: number,
  elapsedMs: number,
): number {
  if (end <= start) return 0;
  const edge = Math.min(64, (end - start) / 3);
  const speed = 720 * Math.min(Math.max(elapsedMs, 0), 32) / 1000;
  if (position < start + edge) {
    return -speed * Math.min(1, (start + edge - position) / edge);
  }
  if (position > end - edge) {
    return speed * Math.min(1, (position - end + edge) / edge);
  }
  return 0;
}

export function scrollDragAncestors(
  element: HTMLElement | null,
  clientX: number,
  clientY: number,
  elapsedMs: number,
): void {
  let scrolledX = false;
  let scrolledY = false;
  for (let parent = element; parent; parent = parent.parentElement) {
    const root = parent === document.scrollingElement;
    const style = getComputedStyle(parent);
    const rect = root
      ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
      : parent.getBoundingClientRect();
    const left = Math.max(0, rect.left);
    const right = Math.min(window.innerWidth, rect.right);
    const top = Math.max(0, rect.top);
    const bottom = Math.min(window.innerHeight, rect.bottom);
    if (right <= left || bottom <= top) continue;
    const dx = getEdgeScrollDelta(clientX, left, right, elapsedMs);
    const dy = getEdgeScrollDelta(clientY, top, bottom, elapsedMs);
    const canScrollX = root || /^(auto|scroll|overlay)$/.test(style.overflowX);
    const canScrollY = root || /^(auto|scroll|overlay)$/.test(style.overflowY);

    // Scroll the nearest ancestor that still has room in each direction.
    if (!scrolledX && canScrollX && clientY >= top && clientY <= bottom &&
      ((dx < 0 && parent.scrollLeft > 0) ||
        (dx > 0 && parent.scrollLeft + parent.clientWidth < parent.scrollWidth))) {
      const previous = parent.scrollLeft;
      parent.scrollLeft += dx;
      scrolledX = parent.scrollLeft !== previous;
    }
    if (!scrolledY && canScrollY && clientX >= left && clientX <= right &&
      ((dy < 0 && parent.scrollTop > 0) ||
        (dy > 0 && parent.scrollTop + parent.clientHeight < parent.scrollHeight))) {
      const previous = parent.scrollTop;
      parent.scrollTop += dy;
      scrolledY = parent.scrollTop !== previous;
    }
    if (scrolledX && scrolledY) break;
  }
}
