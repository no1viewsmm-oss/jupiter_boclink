export function randomizeAttributes(htmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const used = new Set<string>();
  const getRandom = (prefix: string): string => {
    let str: string;
    do {
      str = prefix + "-" + Math.random().toString(36).substring(2, 10);
    } while (used.has(str));
    used.add(str);
    return str;
  };

  const attrs: string[] = ["id", "class", "name", "for"];

  attrs.forEach((attr) => {
    doc.querySelectorAll<HTMLElement>(`[${attr}]`).forEach((el) => {
      el.setAttribute(attr, getRandom(attr));
    });
  });

  return doc.body.innerHTML;
}
