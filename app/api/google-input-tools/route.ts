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

async function transliterateViaGoogle(text: string) {
  const params = new URLSearchParams({
    text,
    itc: "ur-t-i0-und",
    num: "1",
    cp: "0",
    cs: "1",
    ie: "utf-8",
    oe: "utf-8",
  });

  const response = await fetch(
    `https://inputtools.google.com/request?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Google Input Tools failed: ${response.status}`);
  }

  const data = (await response.json()) as GoogleInputToolsResponse;
  return data[0] === "SUCCESS" ? data[1]?.[0]?.[1]?.[0] : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: unknown;
    texts?: unknown;
  } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const texts = Array.isArray(body?.texts)
    ? body.texts
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (!text && texts.length === 0) {
    return Response.json({ text: "", texts: [] }, { status: 400 });
  }

  try {
    if (texts.length > 0) {
      const suggestions = await Promise.all(
        texts.map(async (input) => {
          const suggestion = await transliterateViaGoogle(input);
          return suggestion ?? fallbackTransliterate(input);
        }),
      );
      return Response.json({ texts: suggestions });
    }

    const suggestion = await transliterateViaGoogle(text);

    return Response.json({ text: suggestion ?? fallbackTransliterate(text) });
  } catch {
    if (texts.length > 0) {
      return Response.json({
        texts: texts.map((item) => fallbackTransliterate(item)),
        source: "fallback",
      });
    }

    return Response.json({
      text: fallbackTransliterate(text),
      source: "fallback",
    });
  }
}
