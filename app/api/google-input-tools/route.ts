type GoogleInputToolsResponse =
  | ["SUCCESS", Array<[string, string[]]>]
  | ["FAILED", unknown];

const fallbackWords: Record<string, string> = {
  aaj: "آج",
  aur: "اور",
  hai: "ہے",
  hain: "ہیں",
  karachi: "کراچی",
  lahore: "لاہور",
  islamabad: "اسلام آباد",
  mein: "میں",
  news: "نیوز",
  pakistan: "پاکستان",
  pani: "پانی",
  siyasat: "سیاست",
  shehar: "شہر",
  technology: "ٹیکنالوجی",
};

function fallbackTransliterate(text: string) {
  return text
    .split(/(\s+)/)
    .map((part) => fallbackWords[part.toLowerCase()] ?? part)
    .join("");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: unknown;
  } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return Response.json({ text: "" }, { status: 400 });
  }

  const params = new URLSearchParams({
    text,
    itc: "ur-t-i0-und",
    num: "1",
    cp: "0",
    cs: "1",
    ie: "utf-8",
    oe: "utf-8",
  });

  try {
    const response = await fetch(
      `https://inputtools.google.com/request?${params.toString()}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(`Google Input Tools failed: ${response.status}`);
    }

    const data = (await response.json()) as GoogleInputToolsResponse;
    const suggestion = data[0] === "SUCCESS" ? data[1]?.[0]?.[1]?.[0] : null;

    return Response.json({ text: suggestion ?? fallbackTransliterate(text) });
  } catch {
    return Response.json({
      text: fallbackTransliterate(text),
      source: "fallback",
    });
  }
}
