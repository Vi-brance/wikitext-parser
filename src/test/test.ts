import WikitextParser from "../index";
import type Token from "../token";

const testText = `{{#if:{{{hidever|}}}
|| [[Version history{{Subpage}}|<span style="color: #{{Header/linkcolor|{{{1}}}}};">'''{{Translation|Page updated}}:'''</span>]] {{#if:{{{version|}}}
  | [[:Category:{{{version}}}{{Subpage}}|<span style="color: #{{Header/linkcolor|{{{1}}}}};">{{{version}}}{{#if:{{{incver|}}}|.{{{incver}}}}}</span>]]
  | [[:Category:Unknown Version{{Subpage}}|<span style="color: #{{Header/linkcolor|{{{1}}}}};">{{Check title|Unknown Version|Category|{{Subpage|slash=false|true={{Translate|Unknown Version}}}}}}</span>]]
}}
}}`;

function printToken(src: string, root: Token, depth: number = 0) {
  for (const token of root.children) {
    console.log(
      `${"-".repeat(depth)}${token.type}: ${src.substring(
        token.pos.begin,
        token.pos.end
      )}`
    );
    if (token.children.length) {
      printToken(src, token, depth + 1);
    }
  }
}

describe("WikitextParser", () => {
  it("should parse wikitext with templates", () => {
    const parser = new WikitextParser();
    const token = parser.parseWiki(testText, true);
    printToken(parser.src, token);
  });
});
