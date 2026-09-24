export function getContrastText(hex?: string): string {
  if (!hex) return "inherit";
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "inherit";

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#1a1a1a" : "#ffffff";
}