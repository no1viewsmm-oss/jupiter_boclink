import React, { useEffect, useState } from "react";
import {randomizeHtml} from './randomizeHtml';
export type RenderMethod = "raw" | "fetch" | "iframe";

export interface ImportStaticHTMLProps {
  src: string;
  method?: RenderMethod;
  sanitize?: boolean;
  className?: string;
  wrapperElement?: keyof JSX.IntrinsicElements;
  /** nếu true: tự động chèn các thẻ <link rel="stylesheet"> từ HTML vào <head> */
  forceReloadCSS?: boolean;
}

export default function ImportStaticHTML({
  src,
  method = "fetch",
  sanitize = true,
  className,
  wrapperElement = "div",
  forceReloadCSS = false,
}: ImportStaticHTMLProps) {
  const [html, setHtml] = useState<string | null>(
    method === "raw" ? src : null
  );
  const Wrapper = wrapperElement as any;

  useEffect(() => {
    if (method === "fetch") {
      let mounted = true;
      (async () => {
        try {
          const res = await fetch(src, { cache: "no-store" });
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          let text = await res.text();

          // Tính base URL (thư mục chứa file .html)
          const base = src.substring(0, src.lastIndexOf("/") + 1);

          // Auto fix src/href tương đối → tuyệt đối (bắt cả "" và '')
          text = text.replace(
            /(src|href)=["'](?!http|https|\/)([^"']+)["']/g,
            (_match, attr, path) => `${attr}="${base}${path}"`
          );
          text = randomizeHtml(text);
          if (mounted) setHtml(text);
        } catch (err) {
          console.error("ImportStaticHTML fetch error:", err);
          if (mounted)
            setHtml(
              `<pre style="white-space:pre-wrap;color:red">Error loading HTML: ${String(
                err
              )}</pre>`
            );
        }
      })();
      return () => {
        mounted = false;
      };
    }
  }, [src, method]);

  // Optional sanitization
  const sanitizeHtml = (dirty: string) => {
    if (!sanitize) return dirty;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DOMPurify = require("dompurify");
      return DOMPurify.sanitize(dirty, {
        ADD_TAGS: ["style", "link"],
        ADD_ATTR: ["rel", "href", "type"],
      });
    } catch (e) {
      console.warn("DOMPurify not found — rendering raw HTML");
      return dirty;
    }
  };

  // Chèn CSS vào <head> (giúp browser apply CSS ngay cả khi HTML được inject)
  useEffect(() => {
    if (!forceReloadCSS || !html) return;
    const div = document.createElement("div");
    div.innerHTML = html;
    const links = div.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']");
    const added: HTMLLinkElement[] = [];

    links.forEach((lnk) => {
      if (!document.querySelector(`link[href="${lnk.href}"]`)) {
        const clone = document.createElement("link");
        clone.rel = "stylesheet";
        clone.href = lnk.href;
        document.head.appendChild(clone);
        added.push(clone);
      }
    });

    return () => {
      added.forEach((lnk) => lnk.remove());
    };
  }, [html, forceReloadCSS]);

  if (method === "iframe") {
    return (
      <Wrapper className={className}>
        <iframe
          title={src}
          src={src}
          style={{ width: "100%", border: "none", minHeight: "600px" }}
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html ? sanitizeHtml(html) : "" }}
    />
  );
}

/*
Usage
------
<ImportStaticHTML src="/pages/home.html" method="fetch" forceReloadCSS />
*/
