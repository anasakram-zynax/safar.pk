export function safeNextPath(value: string | string[] | undefined): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /%(?:2f|5c)/i.test(value) ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    return "/";
  try {
    const parsed = new URL(value, "https://safar.local");
    if (
      parsed.origin !== "https://safar.local" ||
      !parsed.pathname.startsWith("/") ||
      parsed.pathname.startsWith("//")
    )
      return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}
