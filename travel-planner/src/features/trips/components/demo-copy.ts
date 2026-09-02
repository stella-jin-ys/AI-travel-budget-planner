export function displayDemoCopy(value: string): string {
  return value
    .replace(/\bsynthetic(?: demonstration)?\s*:?[ ]*/gi, "")
    .replace(/\s+demo\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
