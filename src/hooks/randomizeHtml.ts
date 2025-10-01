// randomizeHtml.ts
import { faker } from "@faker-js/faker";
import * as cheerio from "cheerio";

// random text có nghĩa
function randomMeaningfulText(): string {
  const generators = [
    () => faker.person.fullName(),
    () => faker.lorem.words(3),
    () => faker.lorem.sentence(),
    () => faker.commerce.productName(),
    () => faker.location.city(),
    () => faker.internet.domainName()
  ];
  const pick = generators[Math.floor(Math.random() * generators.length)];
  return pick();
}

// randomize HTML nhưng không đụng đến attributes
export function randomizeHtml(html: string): string {
  const $ = cheerio.load(html);

  $("*").each((_, el) => {
    const node = $(el);

    // Nếu là text node thì random
    node.contents().each((i, child) => {
      if (child.type === "text") {
        const text = $(child).text().trim();
        if (text.length > 0) {
          $(child).replaceWith(randomMeaningfulText());
        }
      }
    });

    // ⚠️ Không đụng đến node.attr()
  });

  return $.html();
}
