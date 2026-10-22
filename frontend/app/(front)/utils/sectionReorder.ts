export function previewSectionOrder(order: string[], fromId: string, toId: string): string[] {
  const from = order.indexOf(fromId);
  const to = order.indexOf(toId);
  if (from < 0 || to < 0 || from === to) return order;
  const result = [...order];
  result.splice(from, 1);
  result.splice(to, 0, fromId);
  return result;
}

// The API moves within the original order, not the intermediate drag previews.
export function getSectionDropTarget(original: string[], preview: string[], fromId: string): string | null {
  const finalIndex = preview.indexOf(fromId);
  const target = original[finalIndex];
  return target && target !== fromId ? target : null;
}
